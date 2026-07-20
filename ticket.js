const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

// Assicurati che questi file esistano nella stessa cartella!
const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const STAFF_ROLE_ID = "1528576030783176835";
const TICKET_CATEGORY_ID = "1528582447443345560";

const QUESTIONS = {
    partner: ["Nome progetto?", "Membri totali?", "Obiettivo?"],
    staff: ["Età?", "Esperienza?", "Perché dovresti essere scelto?"],
    bug: ["Cos'è successo?", "Dove si è verificato?", "Hai prove/screenshot?"],
    report: ["Chi è l'utente?", "Cosa ha fatto?", "Hai le prove?"]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Apri un ticket di assistenza"),

    async execute(interaction) {
        try {
            const menu = new StringSelectMenuBuilder()
                .setCustomId("ticket_category")
                .setPlaceholder("🎫 Seleziona categoria...")
                .addOptions([
                    { label: "Supporto Partner", value: "partner", emoji: "🤝" },
                    { label: "Bando Staff", value: "staff", emoji: "🛡️" },
                    { label: "Segnalazione Bug", value: "bug", emoji: "🐞" },
                    { label: "Report Utente", value: "report", emoji: "🚫" }
                ]);

            const embed = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setTitle("🎫 ELEGANCE | CENTRO SUPPORTO")
                .setDescription("Seleziona una categoria per iniziare.");

            await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
        } catch (error) {
            console.error("Errore nel comando ticket:", error);
        }
    },

    async categoryHandler(interaction) {
        // ... (tutto il resto del tuo codice rimane invariato)
        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `ticket-${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        ticketSystem.createTicket(interaction.user.id, { owner: interaction.user.id, channelId: channel.id, type: type, step: -1 });

        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle("🔔 AVVISO DI APERTURA")
            .setDescription(`Benvenuto ${interaction.user}.\nStai per aprire un ticket per **${type.toUpperCase()}**.\n\nTi verranno poste **3 domande**. Scrivi **'ok'** o **'okay'** per iniziare.`);

        await channel.send({ content: `${interaction.user}`, embeds: [embed] });
        await interaction.update({ content: `✅ Ticket creato: ${channel}`, components: [], ephemeral: true });
    },

    async handleTicketMessage(message) {
        const data = ticketSystem.getTicketByChannel(message.channel.id);
        if (!data || message.author.bot) return;
        // ... (resto della logica domande invariata)
        if (data.step === -1) {
            const conferme = ["ok", "okay", "si", "certo", "ok!", "d'accordo"];
            if (conferme.includes(message.content.toLowerCase().trim())) {
                data.step = 0;
                ticketSystem.updateTicket(data.owner, data);
                return message.channel.send(`🤖 **Domanda 1:** ${QUESTIONS[data.type][0]}`);
            }
        } else if (data.step < 3) {
            data.step++;
            ticketSystem.updateTicket(data.owner, data);
            if (data.step < 3) {
                return message.channel.send(`🤖 **Domanda ${data.step + 1}:** ${QUESTIONS[data.type][data.step]}`);
            } else {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("claim_ticket").setLabel("Prendi in carico").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("close_ticket").setLabel("Chiudi Ticket").setStyle(ButtonStyle.Danger)
                );
                return message.channel.send({ content: "✅ **Ricevuto!** Uno staffer arriverà a breve per assisterti.", components: [row] });
            }
        }
    },
    // ... (buttonHandler e ratingHandler invariati)
    async buttonHandler(interaction) { /* ... */ },
    async ratingHandler(interaction) { /* ... */ }
};
