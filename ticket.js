const { 
    SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, 
    ChannelType, EmbedBuilder, PermissionFlagsBits 
} = require("discord.js");

const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_CATEGORY_ID = "1528582447443345560";
const TICKET_STAFF_ROLES = ["1528576030783176835"];
const EMBED_COLOR = "#2b2d31";
const PREFIX = "︲🎫〞﹒";

// Database domande avanzate (Fake AI)
const QUESTIONS = {
    partner: ["Come si chiama il tuo progetto?", "Quanti membri avete?", "Qual è l'obiettivo della partnership?"],
    staff: ["Da quanto tempo sei nella community?", "Qual è la tua età?", "Perché vorresti entrare nello staff?"],
    bug: ["Descrivi brevemente il bug.", "Dove si è verificato?", "Hai degli screenshot da allegare?"],
    report: ["Chi è l'utente da segnalare?", "Quale regola ha infranto?", "Hai delle prove (screenshot/link)?"]
};

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("Apri un ticket di assistenza"),

    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🎫 Seleziona categoria assistenza")
            .addOptions([
                { label: "Supporto Partner", value: "partner", emoji: "🤝" },
                { label: "Bando Staff", value: "staff", emoji: "🛡️" },
                { label: "Segnalazione Bug", value: "bug", emoji: "🐞" },
                { label: "Report Utente", value: "report", emoji: "🚫" }
            ]);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🎫 ELEGANCE | CENTRO SUPPORTO")
            .setDescription("Seleziona una categoria per iniziare.");

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
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                ...TICKET_STAFF_ROLES.map(r => ({ id: r, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }))
            ]
        });

        ticketSystem.createTicket(interaction.user.id, { owner: interaction.user.id, channelId: channel.id, type: type, step: 0 });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`${PREFIX}Ticket | ${type.toUpperCase()}`)
            .setDescription(`Benvenuto ${interaction.user}. Rispondi alla prima domanda per procedere:`)
            .addFields({ name: "Domanda 1", value: QUESTIONS[type][0] });

        const manageMenu = new StringSelectMenuBuilder()
            .setCustomId("ticket_manage")
            .setPlaceholder("⚙️ Pannello Gestione")
            .addOptions([
                { label: "Prendi in carico (Claim)", value: "claim_ticket", emoji: "✅" },
                { label: "Ping Staff (Countdown)", value: "ping_staff", emoji: "🔔" },
                { label: "Chiudi Ticket", value: "close_ticket", emoji: "🔒" }
            ]);

        await channel.send({ content: `🔔 <@&${TICKET_STAFF_ROLES[0]}>`, embeds: [embed], components: [new ActionRowBuilder().addComponents(manageMenu)] });
        await interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
    },

    async buttonHandler(interaction) {
        const id = interaction.customId;
        const ticketData = ticketSystem.getAllTickets().find(t => t.channelId === interaction.channel.id);
        if (!ticketData) return;

        if (id === "ping_staff") {
            let countdown = 5;
            const msg = await interaction.reply({ content: `🔔 Notifica staff tra ${countdown}s...`, fetchReply: true });
            const interval = setInterval(async () => {
                countdown--;
                if (countdown > 0) await msg.edit(`🔔 Notifica staff tra ${countdown}s...`);
                else {
                    clearInterval(interval);
                    msg.delete();
                    interaction.channel.send(`🔔 <@&${TICKET_STAFF_ROLES[0]}> Richiesta assistenza immediata!`);
                }
            }, 1000);
            return;
        }

        if (id === "claim_ticket") {
            if (!TICKET_STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) return interaction.reply({ content: "❌ Accesso negato.", ephemeral: true });
            interaction.reply({ content: "✅ Ticket preso in carico." });
            interaction.guild.channels.cache.get(LOG_CHANNEL_ID)?.send({ embeds: [new EmbedBuilder().setTitle("✅ TICKET PRESO IN CARICO").setDescription(`Staff: ${interaction.user.tag}\nTicket: ${interaction.channel.name}`).setColor("Green")] });
            return;
        }

        if (id === "close_ticket") {
            interaction.reply("🔒 Chiusura e salvataggio...");
            const file = await transcriptManager.createTranscript(interaction.channel);
            interaction.guild.members.cache.get(ticketData.owner)?.send({ content: "Ecco il transcript del tuo ticket:", files: [file] }).catch(() => {});
            interaction.guild.channels.cache.get(LOG_CHANNEL_ID)?.send({ content: `📁 **Transcript per:** ${interaction.channel.name}`, files: [file] });
            ticketSystem.deleteTicket(ticketData.owner);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    },

    async router(interaction) {
        interaction.customId = interaction.values[0];
        return this.buttonHandler(interaction);
    }
};
