const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_CATEGORY_ID = "1528582447443345560";
const TICKET_STAFF_ROLES = ["1528576030783176835"];
const EMBED_COLOR = "#2b2d31";
const PREFIX = "︲🎫〞﹒";

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("Apri un ticket"),

    async execute(interaction) {
        // Blocco lunedì
        if (new Date().getDay() === 1) {
            return interaction.reply({ content: "🔴 **Sistema Chiuso:** Il supporto è offline ogni lunedì.", ephemeral: true });
        }

        const embed = new EmbedBuilder().setColor(EMBED_COLOR).setTitle("🎫 ELEGANCE | CENTRO SUPPORTO").setDescription("Seleziona una categoria per iniziare.");
        const menu = new StringSelectMenuBuilder().setCustomId("ticket_category").setPlaceholder("🎫 Seleziona categoria...").addOptions([
            { label: "Supporto Partner", value: "partner", emoji: "🤝" },
            { label: "Bando Staff", value: "staff", emoji: "🛡️" },
            { label: "Segnalazione Bug", value: "bug", emoji: "🐞" },
            { label: "Report Utente", value: "report", emoji: "🚫" }
        ]);
        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)], ephemeral: false });
    },

    async categoryHandler(interaction) {
        // NON fare deferReply qui, viene fatto dal buttonHandler!
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
        
        await interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
        
        const manageMenu = new StringSelectMenuBuilder().setCustomId("ticket_manage").setPlaceholder("⚙️ Pannello").addOptions([
            { label: "Claim", value: "claim_ticket", emoji: "✅" },
            { label: "Ping", value: "ping_staff", emoji: "🔔" },
            { label: "Chiudi", value: "close_ticket", emoji: "🔒" }
        ]);
        await channel.send({ content: `<@&${TICKET_STAFF_ROLES[0]}>`, components: [new ActionRowBuilder().addComponents(manageMenu)] });
    },

    async buttonHandler(interaction) {
        // Qui usiamo sempre editReply
        const id = interaction.values ? interaction.values[0] : interaction.customId;
        const data = ticketSystem.getAllTickets().find(t => t.channelId === interaction.channel.id);
        
        if (id === "ping_staff") {
            await interaction.editReply({ content: "🔔 Staff avvisato!" });
            await interaction.channel.send(`<@&${TICKET_STAFF_ROLES[0]}> Richiesta assistenza!`);
        } else if (id === "claim_ticket") {
            await interaction.editReply({ content: `✅ Preso in carico da ${interaction.user}.` });
        } else if (id === "close_ticket") {
            await interaction.editReply({ content: "🔒 Chiusura..." });
            const file = await transcriptManager.createTranscript(interaction.channel);
            interaction.guild.channels.cache.get(LOG_CHANNEL_ID)?.send({ files: [file] });
            ticketSystem.deleteTicket(data?.owner);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    }
};
