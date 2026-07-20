const registry = require("./registry");

module.exports = async (interaction) => {
    // 1. Risposta di sicurezza
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
    }

    // 2. Identifica l'ID del bottone o del menù
    const id = interaction.values ? interaction.values[0] : interaction.customId;

    // 3. Esecuzione automatica dal registro
    const action = registry[id];

    if (action) {
        try {
            await action(interaction);
        } catch (error) {
            console.error(`Errore nell'azione ${id}:`, error);
            await interaction.editReply({ content: "❌ Errore interno." });
        }
    } else {
        await interaction.editReply({ content: "⚠️ Azione non registrata." });
    }
};
