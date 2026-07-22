// ==========================================
// FILE: buttonHandler.js
// ==========================================
const registry = require("./registry");
const apply = require("./apply");
const games = require("./minigame");

module.exports = async (interaction) => {
    const customId = interaction.customId;

    // 1. Intercetta il menu a tendina principale dell'Hub dei minigiochi
    if (interaction.isStringSelectMenu() && customId === 'game_hub_select') {
        return await games.handleGameInteraction(interaction);
    }

    // 2. Ignora i componenti interni dei minigiochi per lasciare il pieno controllo ai Collector locali
    if (
        customId.startsWith('mem_') || 
        customId.startsWith('quiz_') || 
        customId.startsWith('bomb_') || 
        customId.startsWith('react_') || 
        customId === 'hangman_letter'
    ) {
        return; 
    }

    // 3. Gestione speciale dei pulsanti candidatura con ID dinamico (es: apply_accept_123456)
    if (customId.startsWith("apply_accept_") || customId.startsWith("apply_reject_")) {
        return await apply.buttonHandler(interaction);
    }

    // 4. Ricerca standard nella mappa dei registri
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
