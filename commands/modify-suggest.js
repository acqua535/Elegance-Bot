const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// ID Ruolo Staff / Amministrazione Aggiornato
const STAFF_ROLE_ID = "1528576030783176835";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("modify-suggest")
        .setDescription("Modifica lo stato di un suggerimento")
        .addStringOption(option =>
            option
                .setName("link")
                .setDescription("Inserisci il link del messaggio del suggerimento")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("stato")
                .setDescription("Imposta il nuovo stato del suggerimento")
                .setRequired(true)
                .addChoices(
                    { name: "🟡 In valutazione", value: "🟡 In valutazione" },
                    { name: "🟢 Accettato", value: "🟢 Accettato" },
                    { name: "🔴 Rifiutato", value: "🔴 Rifiutato" }
                )
        ),

    async execute(interaction) {
        // Controllo ruolo staff
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Non hai il permesso di modificare i suggerimenti.",
                ephemeral: true
            });
        }

        const link = interaction.options.getString("link");
        const stato = interaction.options.getString("stato");

        // Estrazione ID dal link Discord
        const parts = link.split("/");
        const channelId = parts[5];
        const messageId = parts[6];

        if (!channelId || !messageId) {
            return interaction.reply({
                content: "❌ Link del messaggio non valido.",
                ephemeral: true
            });
        }

        try {
            const channel = await interaction.guild.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageId);

            if (!message.embeds.length) {
                return interaction.reply({
                    content: "❌ Questo messaggio non contiene un embed di suggerimento.",
                    ephemeral: true
                });
            }

            const embed = EmbedBuilder.from(message.embeds[0]);
            const oldFields = embed.data.fields || [];
            const newFields = oldFields.filter(field => field.name !== "📊 Stato");

            newFields.push({
                name: "📊 Stato",
                value: stato,
                inline: true
            });

            embed.setFields(newFields);

            await message.edit({ embeds: [embed] });

            // Aggiorna anche il thread se esiste
            if (message.hasThread) {
                await message.thread.send({
                    content: `⚜️ **Aggiornamento Staff**\n\nIl suggerimento è stato aggiornato a: **${stato}**`
                });
            }

            await interaction.reply({
                content: "✅ Stato del suggerimento aggiornato.",
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "❌ Errore durante la modifica del suggerimento.",
                ephemeral: true
            });
        }
    }
};
