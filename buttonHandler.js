// ==========================================
// FILE: buttonHandler.js (CON CONSOLE.LOG)
// ==========================================
const registryMap = require('./registry');

module.exports = async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    console.log(`[DEBUG] Ricevuta interazione con customId: "${customId}" da @${interaction.user.tag}`);

    // ---------------------------------------------------------
    // 1. GESTIONE MINIGIOCHI
    // ---------------------------------------------------------
    // Menu principale del Minigioco
    if (interaction.isStringSelectMenu() && customId === 'game_hub_select') {
        console.log(`[DEBUG Minigame] Rilevato menu principale game_hub_select!`);
        
        const minigameCmd = interaction.client.commands.get('minigame');
        if (minigameCmd && typeof minigameCmd.handleGameInteraction === 'function') {
            console.log(`[DEBUG Minigame] Comando minigame trovato, avvio handleGameInteraction...`);
            return await minigameCmd.handleGameInteraction(interaction);
        } else {
            console.log(`[DEBUG Minigame] ERRORE: Comando 'minigame' non trovato nella mappa client.commands!`);
        }
    }

    // Bottoni e Menu interni ai Minigiochi (gestiti dai collector)
    const minigamePrefixes = ['quiz_', 'bomb_', 'mem_', 'react_', 'hangman_'];
    if (minigamePrefixes.some(prefix => customId.startsWith(prefix))) {
        console.log(`[DEBUG Minigame] Interazione interna al gioco (${customId}), passo il controllo al collector.`);
        return; 
    }
    // ---------------------------------------------------------

    // Recupera l'handler mappato nel registry
    const handler = registryMap[customId];

    if (!handler) {
        console.log(`[DEBUG] Nessun handler trovato nel registry per: "${customId}"`);

        if (interaction.isButton()) {
            if (customId.startsWith("apply_accept_") || customId.startsWith("apply_reject_")) {
                console.log(`[DEBUG Apply] Gestione candidatura dinamica per: ${customId}`);
                const apply = require("./apply");
                return await apply.buttonHandler(interaction);
            }
        }

        if (!interaction.replied && !interaction.deferred) {
            console.log(`[DEBUG] Rispondo con errore 'Azione non riconosciuta' per: "${customId}"`);
            return interaction.reply({
                content: "❌ **Azione non riconosciuta o interazione scaduta.**",
                flags: 64
            }).catch(() => {});
        }
        return;
    }

    // Esegue la funzione corrispondente presa dal registry
    try {
        console.log(`[DEBUG Registry] Eseguo la funzione associata a: "${customId}"`);
        await handler(interaction);
    } catch (error) {
        console.error(`🚨 Errore durante la gestione dell'interazione [${customId}]:`, error);
        
        const errorMessage = "❌ Si è verificato un errore durante l'esecuzione dell'azione.";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: 64 }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, flags: 64 }).catch(() => {});
        }
    }
};
