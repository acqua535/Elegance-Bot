const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_CATEGORY_ID = "1528582447443345560";
const TICKET_STAFF_ROLES = ["1528576030783176835"];
const EMBED_COLOR = "#2b2d31";
const PREFIX = "︲🎫〞﹒";

const QUESTIONS = {
    partner: ["Nome progetto?", "Membri totali?", "Obiettivo partnership?"],
    staff: ["Da quanto sei qui?", "Età?", "Motivazione candidatura?"],
    bug: ["Descrizione bug?", "Dove si verifica?", "Hai screenshot?"],
    report: ["Chi vuoi segnalare?", "Quale regola ha infranto?", "Hai delle prove?"]
};

function getOrari() {
    const now = new Date();
    const ora = now.getHours();
    const giorno = now.getDay();
    const isEstate = (now.getMonth() >= 5 && now.getMonth() <= 8);
    const chiusura = isEstate ? 24 : 21;
    if (giorno === 1) return "🔴 **Chiuso** (Ogni Lunedì)";
    if (ora < 14 || ora >= chiusura) return `🔴 **Chiuso** (Apertura 14:00 - ${chiusura}:00)`;
    return `🟢 **Aperto** (Fino alle ${chiusura}:00)`;
}

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("Apri un ticket di supporto"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🎫 ELEGANCE | CENTRO SUPPORTO")
            .setDescription(`Benvenuto, ${interaction.user}. Scegli una categoria:\n\n**STATO:** ${getOrari()}\n\n⚠️ *L'abuso del sistema comporta sanzioni.*`);
        
        const menu = new StringSelectMenuBuilder().setCustomId("ticket_category").setPlaceholder("🎫 Seleziona categoria...").addOptions([
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
        const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle(`🎫 Ticket: ${type.toUpperCase()}`).setDescription(`Domanda 1: ${QUESTIONS[type][0]}`);
        const menu = new StringSelectMenuBuilder().setCustomId("ticket_manage").setPlaceholder("⚙️ Pannello Gestione").addOptions([
            { label: "Prendi in carico", value: "claim_ticket", emoji: "✅" },
            { label: "Ping Staff", value: "ping_staff", emoji: "🔔" },
            { label: "Chiudi Ticket", value: "close_ticket", emoji: "🔒" }
        ]);
        await channel.send({ content: `<@&${TICKET_STAFF_ROLES[0]}>`, embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
        await interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
        interaction.guild.channels.cache.get(LOG_CHANNEL_ID)?.send(`📂 **Ticket Aperto:** ${channel.name} da ${interaction.user.tag}`);
    },

    async buttonHandler(interaction) {
        const id = interaction.values ? interaction.values[0] : interaction.customId;
        const data = ticketSystem.getAllTickets().find(t => t.channelId === interaction.channel.id);
        if (!data) return interaction.editReply({ content: "❌ Dati non trovati.", ephemeral: true });

        const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (id === "ping_staff") {
            await interaction.editReply({ content: "🔔 Ping inviato allo staff!" });
            await interaction.channel.send(`<@&${TICKET_STAFF_ROLES[0]}> Richiesta assistenza!`);
            log?.send(`🔔 **Ping:** ${interaction.user.tag} ha pingato lo staff in ${interaction.channel.name}`);
        } else if (id === "claim_ticket") {
            if (!TICKET_STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) return interaction.editReply({ content: "❌ Solo Staff.", ephemeral: true });
            await interaction.editReply({ content: `✅ Preso in carico da ${interaction.user}.` });
            log?.send(`✅ **Claim:** ${interaction.user.tag} ha preso in carico ${interaction.channel.name}`);
        } else if (id === "close_ticket") {
            await interaction.editReply({ content: "🔒 Chiusura in corso..." });
            const file = await transcriptManager.createTranscript(interaction.channel);
            interaction.guild.members.cache.get(data.owner)?.send({ content: "📁 Il tuo transcript:", files: [file] }).catch(() => {});
            log?.send({ content: `📁 **Chiuso:** ${interaction.channel.name} da ${interaction.user.tag}`, files: [file] });
            ticketSystem.deleteTicket(data.owner);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    },

    async router(interaction) { return this.buttonHandler(interaction); }
};
                                     
