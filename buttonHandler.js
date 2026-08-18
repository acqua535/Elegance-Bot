// ==========================================
// FILE: buttonHandler.js
// ==========================================
const registryMap = require('./registry');

module.exports = async (interaction) => {
    // Gestione unificata per Bottoni, Select Menu e Modali
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    const customId = interaction.customId;

    // ---------------------------------------------------------
    // 1. GESTIONE MINIGIOCHI (Inizio fix)
    // ---------------------------------------------------------
    // Se è la tendina per far partire il minigioco:
    if (interaction.isStringSelectMenu() && customId === 'game_hub_select') {
        const minigameCmd = interaction.client.commands.get('minigame');
        if (minigameCmd && minigameCmd.handleGameInteraction) {
            return await minigameCmd.handleGameInteraction(interaction);
        }
    }

    // Se sono i bottoni/menu INTERNI ai minigiochi (gestiti dai collector):
    const minigamePrefixes = ['quiz_', 'bomb_', 'mem_', 'react_', 'hangman_'];
    if (minigamePrefixes.some(prefix => customId.startsWith(prefix))) {
        return; // Esce e lascia lavorare i collector senza inviare errori
    }
    // ---------------------------------------------------------

    // Recupera l'handler mappato nel registry
    const handler = registryMap[customId];

    if (!handler) {
        // Se non trova un handler diretto nel registry, controlla se è un bottone dinamico con prefisso (es: candidatura)
        if (interaction.isButton()) {
            if (customId.startsWith("apply_accept_") || customId.startsWith("apply_reject_")) {
                const apply = require("./apply");
                return await apply.buttonHandler(interaction);
            }
        }

        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({
                content: "❌ **Azione non riconosciuta o interazione scaduta.**",
                flags: 64 // MessageFlags.Ephemeral
            }).catch(() => {});
        }
        return;
    }

    // Esegue la funzione corrispondente presa dal registry
    try {
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
