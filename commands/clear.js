const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Cancella messaggi nel canale")
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Numero di messaggi da eliminare (1-100)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    let amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "❌ Devi scegliere un numero tra 1 e 100",
        ephemeral: true
      });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);

      return interaction.reply({
        content: `🧹 Eliminati ${deleted.size} messaggi`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore durante la cancellazione (messaggi troppo vecchi?)",
        ephemeral: true
      });
    }
  }
};
