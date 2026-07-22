// ==========================================
// FILE: buttonHandler.js (UNIVERSALE)
// ==========================================
const registry = require("./registry");
const games = require("./minigame");
const apply = require("./apply");

module.exports = async (interaction) => {
    // Accetta sia pulsanti che menu a tendina
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    const customId = interaction.customId;

    // 1. Gestione speciale per i minigiochi (Hub e menu interno dell'impiccato)
    if (interaction.isStringSelectMenu() && customId === 'game_hub_select') {
        return await games.handleGameInteraction(interaction);
    }

    if (customId === 'hangman_letter') {
        // I minigiochi gestiscono i loro componenti tramite i propri collector locali, quindi ignoriamo qui
        return;
    }

    // 2. Ignora i bottoni interni dei minigiochi che usano collector locali
    if (
        customId.startsWith('mem_') || 
        customId.startsWith('quiz_') || 
        customId.startsWith('bomb_') || 
        customId.startsWith('react_')
    ) {
        return; 
    }

    // 3. Gestione speciale per candidature con ID dinamico (es: apply_accept_IDutente)
    if (customId.startsWith("apply_accept_") || customId.startsWith("apply_reject_")) {
        return await apply.buttonHandler(interaction);
    }

    // 4. Ricerca nel registry per TUTTI gli altri bottoni del bot (Verifica, Ticket, Inviti, Setup vari)
    const handler = registry[customId];

    if (!handler) {
        console.warn(`⚠️ Nessun handler registrato per il componente: ${customId}`);
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({
                content: "❌ Azione non riconosciuta o pulsante scaduto.",
                flags: 64
            }).catch(() => {});
        }
        return;
    }

    try {
        await handler(interaction);
    } catch (error) {
        console.error(`🚨 Errore durante l'esecuzione del componente ${customId}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "❌ Si è verificato un errore durante l'elaborazione.",
                flags: 64
            }).catch(() => {});
        }
    }
};
