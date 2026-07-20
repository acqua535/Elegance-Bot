const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

// Ruolo autorizzato ad usare /say (Usato ID: 1528576026421231726)
const SAY_ROLE_ID = "1528576026421231726";

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
        // Controllo ruolo staff
        if (!interaction.member.roles.cache.has(SAY_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Non hai il permesso di usare questo comando.",
                ephemeral: true
            });
        }

        const messaggio = interaction.options.getString("messaggio");

        // Il bot invia il messaggio direttamente
        await interaction.channel.send({ content: messaggio });
        
        // Risposta effimera di conferma
        await interaction.reply({
            content: "✅ Messaggio inviato.",
            ephemeral: true
        });
    }
};
