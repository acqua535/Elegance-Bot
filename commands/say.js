// ==========================================
// FILE: say.js (VERSIONE COMPLETA E FIXATA)
// ==========================================
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

// Ruolo autorizzato ad usare /say
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
        if (!interaction.member?.roles?.cache?.has(SAY_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Non hai il permesso di usare questo comando.",
                flags: MessageFlags.Ephemeral
            });
        }

        const messaggio = interaction.options.getString("messaggio");

        try {
            // Differisci subito la risposta per evitare il timeout di 3 secondi (Unknown Interaction)
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // Il bot invia il messaggio nel canale
            await interaction.channel.send({ content: messaggio });

            // Conferma di invio inviata dopo l'operazione
            await interaction.editReply({
                content: "✅ Messaggio inviato con successo!"
            });
        } catch (error) {
            console.error("🚨 Errore durante l'esecuzione del comando /say:", error);

            const errorMessage = "❌ Si è verificato un errore durante l'invio del messaggio.";
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: errorMessage }).catch(() => {});
            } else {
                await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
    }
};
