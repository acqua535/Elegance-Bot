const fs = require("fs");
const path = require("path");

// Carichiamo dinamicamente tutte le azioni da una cartella dedicata
// Così ogni volta che aggiungi un nuovo bottone, basta aggiungere un file
const actions = new Map();

// Carichiamo i file (facoltativo, ma pulitissimo)
// Per ora, teniamo la logica dentro un oggetto per semplicità
const actionRegistry = {
    "claim_ticket": require("./actions/ticketActions").claim,
    "close_ticket": require("./actions/ticketActions").close,
    "verify_button": require("./actions/verifyActions").verify,
    // Aggiungi qui qualsiasi nuovo ID bottone senza toccare altro codice
};

module.exports = async (interaction) => {
    // Risposta immediata per evitare il timeout di Discord
    await interaction.deferReply({ ephemeral: true });

    const actionId = interaction.isStringSelectMenu() ? interaction.values[0] : interaction.customId;
    
    // Cerchiamo l'azione nel registro
    const handler = actionRegistry[actionId];

    if (!handler) {
        return interaction.editReply({ content: "❌ Nessuna funzione trovata per questo pulsante." });
    }

    try {
        await handler(interaction);
    } catch (error) {
        console.error(`❌ Errore esecuzione ${actionId}:`, error);
        interaction.editReply({ content: "❌ Si è verificato un errore critico." }).catch(() => {});
    }
};
