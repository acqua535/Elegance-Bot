const {
    SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder,
    ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits
} = require("discord.js");

const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_CATEGORY_ID = "1528582447443345560";
const TICKET_STAFF_ROLES = ["1528576030783176835"];
const EMBED_BLACK = "#2b2d31";

const DOMANDE = {
    bug: ["Qual è il bug riscontrato?", "Da quanto tempo persiste?", "Quali sono i passaggi per riprodurlo?"],
    partner: ["Che server rappresenti?", "Qual è la tua proposta?", "Quanti membri ha il tuo server?"],
    staff: ["Età?", "Esperienza precedente?", "Perché dovremmo prenderti?"],
    idea: ["Qual è la tua idea?", "Come aiuterebbe il server?", "C'è altro da aggiungere?"]
};

function isStaff(member) {
    return TICKET_STAFF_ROLES.some(id => member.roles.cache.has(id));
}

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("Apri un ticket"),

    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🎫 Seleziona categoria")
            .addOptions([
                { label: "Supporto Partner", value: "partner", emoji: "🤝" },
                { label: "Bando Staff", value: "staff", emoji: "🛡️" },
                { label: "Segnalazione Bug", value: "bug", emoji: "🐞" },
                { label: "Idee / Suggerimenti", value: "idea", emoji: "💡" }
            ]);

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(EMBED_BLACK).setTitle("🎫 CENTRO SUPPORTO").setDescription("Seleziona una categoria per procedere.")],
            components: [new ActionRowBuilder().addComponents(menu)]
        });
    },

    async categoryHandler(interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (ticketSystem.hasOpenTicket(interaction.user.id)) return interaction.editReply({ content: "❌ Hai già un ticket aperto." });

        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `︲🎫〞﹒${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                ...TICKET_STAFF_ROLES.map(r => ({ id: r, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }))
            ]
        });

        ticketSystem.createTicket(interaction.user.id, { owner: interaction.user.id, channelId: channel.id, type: type, step: 0, lastPing: 0 });

        const manageMenu = new StringSelectMenuBuilder()
            .setCustomId("ticket_manage")
            .setPlaceholder("⚙️ Strumenti Gestione")
            .addOptions([
                { label: "Ping Staff", value: "ping_staff", emoji: "🔔" },
                { label: "Chiudi Ticket", value: "close_ticket", emoji: "🔒" }
            ]);

        await channel.send({
            content: `🔔 <@&${TICKET_STAFF_ROLES[0]}>\n\n**🤖 ASSISTENTE IA:**\nCiao! Rispondi a queste 3 domande una alla volta per aiutarci a capire meglio. Tra 3 secondi inizierò.`
        });

        setTimeout(async () => {
            await channel.send(`**DOMANDA 1/3:** ${DOMANDE[type][0]}`);
            const data = ticketSystem.getTicket(interaction.user.id);
            data.step = 1;
            ticketSystem.updateTicket(interaction.user.id, data);
        }, 3000);

        await channel.send({ components: [new ActionRowBuilder().addComponents(manageMenu)] });
        await interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
    },

    async buttonHandler(interaction) {
        const ticketData = ticketSystem.getAllTickets().find(t => t.channelId === interaction.channel.id);
        if (!ticketData) return;

        if (interaction.customId === "ping_staff") {
            const now = Date.now();
            if (ticketData.lastPing && (now - ticketData.lastPing < 86400000)) 
                return interaction.reply({ content: "❌ Puoi pingare lo staff solo una volta ogni 24h.", ephemeral: true });
            
            ticketData.lastPing = now;
            ticketSystem.updateTicket(ticketData.owner, ticketData);
            return interaction.reply(`🔔 <@&${TICKET_STAFF_ROLES[0]}> - Richiesta attenzione da ${interaction.user}!`);
        }

        if (interaction.customId === "close_ticket") {
            if (interaction.user.id !== ticketData.owner && !isStaff(interaction.member)) return interaction.reply({ content: "❌ No.", ephemeral: true });
            
            await interaction.reply("🔒 Chiusura in corso...");
            const file = await transcriptManager.createTranscript(interaction.channel);
            
            const target = await interaction.guild.members.fetch(ticketData.owner).catch(() => null);
            if (target) await target.send({ content: "Ecco la trascrizione del tuo ticket:", files: [file] }).catch(() => {});

            ticketSystem.deleteTicket(ticketData.owner);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    },

    async router(interaction) {
        interaction.customId = interaction.values[0];
        return this.buttonHandler(interaction);
    }
};
                 
