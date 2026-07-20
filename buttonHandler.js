const registry = require("./registry");

module.exports = async (interaction) => {
    // Risposta immediata per evitare il timeout di Discord
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
    }

    const id = interaction.customId;
    const value = interaction.values ? interaction.values[0] : null;
    
    // Controlla nel registro se esiste l'azione (sia per ID che per Value)
    const action = registry[id] || registry[value];

    if (action) {
        try {
            await action(interaction);
        } catch (error) {
            console.error(`❌ Errore in ${id || value}:`, error);
            await interaction.editReply({ content: "❌ Errore critico nel gioco/ticket." }).catch(() => {});
        }
    } else {
        console.warn(`⚠️ Azione non trovata: ${id || value}`);
        await interaction.editReply({ content: "⚠️ Funzione non ancora implementata." });
    }
};
