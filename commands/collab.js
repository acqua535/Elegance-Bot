const { SlashCommandBuilder } = require("discord.js");

// CONFIG ID AGGIORNATI (Elegance Sponsoring)
const CHANNEL_ID = "1528576197741772902"; // Canale dove inviare la collaborazione
const LOG_ID = "1528576197741772902";     // Canale Log Privato

module.exports = {
    data: new SlashCommandBuilder()
        .setName("collab")
        .setDescription("Crea una richiesta collaborazione")
        .addUserOption(option =>
            option
                .setName("richiesta_da")
                .setDescription("Utente che richiede la collaborazione")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("categoria")
                .setDescription("Categoria del server")
                .setRequired(true)
                .addChoices(
                    { name: "🌐 Community", value: "🌐 Community" },
                    { name: "🎮 Gaming", value: "🎮 Gaming" },
                    { name: "🎭 Roleplay", value: "🎭 Roleplay" },
                    { name: "🚗 FiveM", value: "🚗 FiveM" }
                )
        )
        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione della collaborazione")
                .setRequired(true)
        ),

    async execute(interaction) {
        const richiesta = interaction.options.getUser("richiesta_da");
        const categoria = interaction.options.getString("categoria");
        const descrizione = interaction.options.getString("descrizione");

        // Messaggio iniziale totalmente pulito, mostra direttamente la descrizione inserita
        const primoMessaggio = `━━━━━━━⚜️━━━━━━━\n\n${descrizione}\n\n━━━━━━━⚜️━━━━━━━`;

        const secondoMessaggio = `━━━━━━━⚜️━━━━━━━\n\n👤 **Autore**\n${interaction.user}\n\n📌 **Richiesta da**\n${richiesta}\n\n🏷️ **Categoria**\n${categoria}\n\n━━━━━━━⚜️━━━━━━━`;

        const channel = interaction.guild.channels.cache.get(CHANNEL_ID);

        if (!channel) {
            return interaction.reply({
                content: "❌ Canale collaborazione non trovato.",
                ephemeral: true
            });
        }

        await channel.send(primoMessaggio);
        await channel.send(secondoMessaggio);

        const log = interaction.guild.channels.cache.get(LOG_ID);
        if (log) {
            await log.send(
                `📋 **LOG COLLABORAZIONE**\n\n👤 Autore:\n${interaction.user}\n\n📌 Richiesta da:\n${richiesta}\n\n🏷️ Categoria:\n${categoria}\n\n📝 Descrizione:\n${descrizione}\n\n⏰ <t:${Math.floor(Date.now() / 1000)}:F>`
            );
        }

        await interaction.reply({
            content: "✅ Collaborazione inviata correttamente.",
            ephemeral: true
        });
    }
};
