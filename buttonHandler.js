const registry = require("./registry");

module.exports = async (interaction) => {
    // Gestione Deferred: le SelectMenu spesso necessitano deferUpdate, i bottoni deferReply
    if (!interaction.deferred && !interaction.replied) {
        if (interaction.isStringSelectMenu()) {
            await interaction.deferUpdate();
        } else {
            await interaction.deferReply({ ephemeral: true });
        }
    }

    const id = interaction.customId;
    const value = interaction.values ? interaction.values[0] : null;
    const action = registry[id] || registry[value];

    if (action) {
        try {
            await action(interaction);
        } catch (error) {
            console.error(`❌ Errore in ${id || value}:`, error);
            await interaction.editReply({ content: "❌ Errore critico nel sistema." }).catch(() => {});
        }
    }
};
