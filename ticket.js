const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_CATEGORY_ID = "1528582447443345560";
const TICKET_STAFF_ROLES = ["1528576030783176835"];
const EMBED_COLOR = "#2b2d31";
const PREFIX = "︲🎫〞﹒";

const QUESTIONS = {
    partner: ["Come si chiama il tuo progetto?", "Quanti membri avete?", "Qual è l'obiettivo della partnership?"],
    staff: ["Da quanto tempo sei nella community?", "Qual è la tua età?", "Perché vorresti entrare nello staff?"],
    bug: ["Descrivi brevemente il bug.", "Dove si è verificato?", "Hai degli screenshot da allegare?"],
    report: ["Chi è l'utente da segnalare?", "Quale regola ha infranto?", "Hai delle prove?"]
};

function getOrariInfo() {
    const now = new Date();
    const ora = now.getHours();
    const giorno = now.getDay();
    const isEstate = (now.getMonth() >= 5 && now.getMonth() <= 8);
    const chiusura = isEstate ? "00:00" : "21:00";
    if (giorno === 1) return "🔴 **Chiuso** (Ogni Lunedì)";
    if (ora < 14) return "🔴 **Chiuso** (Apriamo alle 14:00)";
    return `🟢 **Aperto** (Fino alle ${chiusura})`;
}

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("Apri un ticket"),
    async execute(interaction) {
        const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle("🎫 ELEGANCE | CENTRO SUPPORTO").setDescription(
            "Il sistema permette di parlare con lo staff per supporto o collaborazioni.\n\n" +
            `**STATO ATTUALE:** ${getOrariInfo()}\n` +
            "• Estivo/Festivi: 14:00 - 00:00\n• Scolastico: 14:00 - 21:00\n\n" +
            "⚠️ *L'apertura di ticket inutili comporta un warn.*"
        );
        const menu = new StringSelectMenuBuilder().setCustomId("ticket_category").setPlaceholder("🎫 Seleziona una categoria...").addOptions([
            { label: "Supporto Partner", value: "partner", emoji: "🤝" },
            { label: "Bando Staff", value: "staff", emoji: "🛡️" },
            { label: "Segnalazione Bug", value: "bug", emoji: "🐞" },
            { label: "Report Utente", value: "report", emoji: "🚫" }
        ]);
        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)], ephemeral: false });
    },
    async categoryHandler(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `${PREFIX}${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ...TICKET_STAFF_ROLES.map(r => ({ id: r, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
            ]
        });
        ticketSystem.createTicket(interaction.user.id, { owner: interaction.user.id, channelId: channel.id, type: type, step: 0 });
        const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(`${PREFIX}Ticket | ${type.toUpperCase()}`).setDescription(`Benvenuto ${interaction.user}. Rispondi:\n**Domanda 1:** ${QUESTIONS[type][0]}`);
        const manageMenu = new StringSelectMenuBuilder().setCustomId("ticket_manage").setPlaceholder("⚙️ Pannello Gestione").addOptions([
            { label: "Claim", value: "claim_ticket", emoji: "✅" },
            { label: "Ping Staff", value: "ping_staff", emoji: "🔔" },
            { label: "Chiudi", value: "close_ticket", emoji: "🔒" }
        ]);
        await channel.send({ content: `<@&${TICKET_STAFF_ROLES[0]}>`, embeds: [embed], components: [new ActionRowBuilder().addComponents(manageMenu)] });
        await interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
    },
    async buttonHandler(interaction) {
        const id = interaction.values ? interaction.values[0] : interaction.customId;
        const ticketData = ticketSystem.getAllTickets().find(t => t.channelId === interaction.channel.id);
        if (!ticketData) return;
        if (id === "ping_staff") {
            await interaction.reply({ content: `🔔 <@&${TICKET_STAFF_ROLES[0]}> Richiesta assistenza immediata!`, ephemeral: false });
        } else if (id === "claim_ticket") {
            if (!TICKET_STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) return interaction.reply({ content: "❌ No.", ephemeral: true });
            await interaction.reply({ content: `✅ Preso in carico da ${interaction.user}.` });
        } else if (id === "close_ticket") {
            await interaction.reply("🔒 Chiusura in corso...");
            const file = await transcriptManager.createTranscript(interaction.channel);
            interaction.guild.members.cache.get(ticketData.owner)?.send({ content: "Ecco il transcript:", files: [file] }).catch(() => {});
            interaction.guild.channels.cache.get(LOG_CHANNEL_ID)?.send({ content: `📁 **Transcript:** ${interaction.channel.name}`, files: [file] });
            ticketSystem.deleteTicket(ticketData.owner);
            setTimeout(() => interaction.channel.delete(), 3000);
        }
    },
    async router(interaction) {
        return this.buttonHandler(interaction);
    }
};
                
