// ==========================================
// FILE: buttonHandler.js (SUPER LOG DI DEBUG)
// ==========================================
const registryMap = require('./registry');

module.exports = async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    console.log(`[BUTTON-HANDLER] 📥 Ricevuta interazione customId: "${customId}" da @${interaction.user.tag}`);

    // ---------------------------------------------------------
    // 0. GESTIONE DIRETTA STICKY SYSTEM
    // ---------------------------------------------------------
    if (customId.startsWith('sticky_btn_') || customId.startsWith('sticky_modal_')) {
        console.log(`[BUTTON-HANDLER] 📌 Intercettata azione Sticky: "${customId}"`);
        try {
            const stickyEvents = require('./stickyEvents');
            if (stickyEvents && typeof stickyEvents.handleInteraction === 'function') {
                console.log(`[BUTTON-HANDLER] ➡️ Chiamata a stickyEvents.handleInteraction()...`);
                return await stickyEvents.handleInteraction(interaction);
            } else {
                console.error(`[BUTTON-HANDLER] ❌ stickyEvents.handleInteraction NON TROVATO!`);
            }
        } catch (err) {
            console.error(`[BUTTON-HANDLER] 🚨 ERRORE IMPREVISTO IN CARICAMENTO STICKY:`, err);
        }
    }

    // ---------------------------------------------------------
    // 1. GESTIONE MINIGIOCHI
    // ---------------------------------------------------------
    if (interaction.isStringSelectMenu() && customId === 'game_hub_select') {
        console.log(`[BUTTON-HANDLER] 🎮 Menu Minigiochi game_hub_select`);
        const minigameCmd = interaction.client.commands.get('minigame');
        if (minigameCmd && typeof minigameCmd.handleGameInteraction === 'function') {
            return await minigameCmd.handleGameInteraction(interaction);
        }
    }

    const minigamePrefixes = ['quiz_', 'bomb_', 'mem_', 'react_', 'hangman_'];
    if (minigamePrefixes.some(prefix => customId.startsWith(prefix))) {
        console.log(`[BUTTON-HANDLER] 🎮 Interazione interna gioco (${customId}), gestita da Collector.`);
        return; 
    }

    // ---------------------------------------------------------
    // 2. REGISTRY MAP
    // ---------------------------------------------------------
    const handler = registryMap[customId];

    if (!handler) {
        console.warn(`[BUTTON-HANDLER] ⚠️ Nessun handler trovato nel Registry per: "${customId}"`);

        if (interaction.isButton()) {
            if (customId.startsWith("apply_accept_") || customId.startsWith("apply_reject_")) {
                console.log(`[BUTTON-HANDLER] Candidatura dinamica per: ${customId}`);
                const apply = require("./apply");
                return await apply.buttonHandler(interaction);
            }
        }

        if (!interaction.replied && !interaction.deferred) {
            console.log(`[BUTTON-HANDLER] ❌ Invio risposta 'Azione non riconosciuta' per: "${customId}"`);
            return interaction.reply({
                content: "❌ **Azione non riconosciuta o interazione scaduta.**",
                flags: 64
            }).catch(() => {});
        }
        return;
    }

    try {
        console.log(`[BUTTON-HANDLER] ⚙️ Esecuzione handler da Registry per: "${customId}"`);
        await handler(interaction);
    } catch (error) {
        console.error(`🚨 Errore durante l'esecuzione dell'interazione [${customId}]:`, error);
        const errorMessage = "❌ Si è verificato un errore durante l'esecuzione dell'azione.";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: 64 }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, flags: 64 }).catch(() => {});
        }
    }
};
        
