const registry = require("./registry");
const apply = require("./apply");
const games = require("./minigame"); // <--- Importante: importa il file dei minigiochi

module.exports = async (interaction) => {
    const customId = interaction.customId;

    // 1. INTERCETTA SUBITO IL MENU A TENDINA DELL'HUB MINIGIOCHI
    if (interaction.isStringSelectMenu() && customId === 'game_hub_select') {
        return await games.handleGameInteraction(interaction);
    }

    // Gestione speciale dei pulsanti candidatura con ID dinamico (es: apply_accept_123456)
    if (customId.startsWith("apply_accept_") || customId.startsWith("apply_reject_")) {
        return await apply.buttonHandler(interaction);
    }

    const handler = registry[customId];

    if (!handler) {
        console.warn(`⚠️ Nessun handler registrato per il pulsante: ${customId}`);
        return interaction.reply({
            content: "❌ Azione non riconosciuta o pulsante scaduto.",
            flags: 64
        }).catch(() => {});
    }

    try {
        await handler(interaction);
    } catch (error) {
        console.error(`🚨 Errore durante l'esecuzione del pulsante ${customId}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "❌ Si è verificato un errore durante l'elaborazione del pulsante.",
                flags: 64
            }).catch(() => {});
        }
    }
};
