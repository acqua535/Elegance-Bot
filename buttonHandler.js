const ticket = require("./ticket");

module.exports = async (interaction) => {
    // Risposta immediata per evitare il timeout di Discord
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
    }

    // Passiamo tutto al router interno di ticket.js
    // Questo gestisce sia menu che bottoni
    try {
        await ticket.router(interaction);
    } catch (error) {
        console.error("Errore nel router ticket:", error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: "❌ Errore durante l'esecuzione." });
        }
    }
};
