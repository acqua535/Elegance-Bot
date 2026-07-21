const registry = require("./registry");

/**
 * Gestore globale per TUTTI i bottoni del bot
 * @param {import('discord.js').ButtonInteraction} interaction 
 */
module.exports = async (interaction) => {
    // Ci assicuriamo che sia un bottone
    if (!interaction.isButton()) return;

    const buttonId = interaction.customId;
    
    // Recupera la funzione dal registry usando l'ID del bottone
    const action = registry[buttonId];

    // Se non esiste una logica registrata per questo customId
    if (!action) {
        console.warn(`[BUTTON_HANDLER] Nessuna azione trovata per il bottone ID: "${buttonId}"`);
        return interaction.reply({
            content: "⚠️ **Azione non valida:** Questo bottone non è collegato ad alcuna funzione registrata.",
            flags: 64 // Ephemeral
        }).catch(() => {});
    }

    try {
        // Eseguiamo la funzione specifica del bottone passandogli l'interazione
        await action(interaction);
    } catch (error) {
        console.error(`❌ [BUTTON_ERROR] Errore nell'esecuzione del bottone "${buttonId}":`, error);

        const errorMessage = { content: "❌ **Errore di Sistema:** Impossibile elaborare l'azione del pulsante." };

        // Risposta dinamica se l'interazione è già stata deferita/risposta dal bottone stesso
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(errorMessage).catch(() => {});
        } else {
            await interaction.reply({ ...errorMessage, flags: 64 }).catch(() => {});
        }
    }
};
