const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const SAY_ROLE_ID = "1505192718068879430";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Invia un messaggio tramite Elegance-Bot")
        .addStringOption(option =>
            option
                .setName("messaggio")
                .setDescription("Il messaggio da inviare")
                .setRequired(true)
        ),

    async execute(interaction) {

        // Controllo ruolo
        if (!interaction.member.roles.cache.has(SAY_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Non hai il permesso di usare questo comando.",
                ephemeral: true
            });
        }

        const messaggio = interaction.options.getString("messaggio");

        // Risponde solo il bot
        await interaction.reply({
            content: messaggio
        });
    }
};
