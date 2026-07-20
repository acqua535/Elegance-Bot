const registry = require("./registry");

module.exports = async (interaction) => {
    // 1. Risposta di sicurezza
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
    }

    // 2. Prendi l'ID o il primo valore selezionato
    const id = interaction.customId;
    const value = interaction.values ? interaction.values[0] : null;

    // 3. Cerca nel registry prima l'ID, poi il valore
    const action = registry[id] || registry[value];

    if (action) {
        try {
            await action(interaction);
        } catch (error) {
            console.error(`❌ Errore esecuzione ${id || value}:`, error);
            await interaction.editReply({ content: "❌ Errore critico." }).catch(() => {});
        }
    } else {
        console.warn(`⚠️ Azione non trovata per ID: ${id} o Valore: ${value}`);
        await interaction.editReply({ content: "⚠️ Azione non riconosciuta." });
    }
};
