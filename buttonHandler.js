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

    // ---------------------------------------------------------
    // 0. GESTIONE SPECIALE TICKET (Menu, Pulsanti, Rating)
    // ---------------------------------------------------------
    const ticketCmd = interaction.client.commands.get('ticket');

    // Menu a tendina dei ticket
    if (interaction.isStringSelectMenu() && customId === 'ticket_category') {
        if (ticketCmd && ticketCmd.categoryHandler) {
            return await ticketCmd.categoryHandler(interaction);
        }
    }

    // Pulsanti interni dei ticket
    if (['claim_ticket', 'ping_staff', 'close_ticket'].includes(customId)) {
        if (ticketCmd && ticketCmd.buttonHandler) {
            return await ticketCmd.buttonHandler(interaction);
        }
    }

    // Valutazione / Rating del ticket
    if (customId.startsWith('rate_')) {
        if (ticketCmd && ticketCmd.ratingHandler) {
            return await ticketCmd.ratingHandler(interaction);
        }
    }
    // ---------------------------------------------------------

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

    // 4. Ricerca nel registry per TUTTI gli altri bottoni del bot (Verifica, Inviti, Setup vari)
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
