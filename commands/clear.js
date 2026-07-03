const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Cancella messaggi")
    .addIntegerOption(opt =>
      opt.setName("amount")
        .setDescription("Numero messaggi")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    await interaction.channel.bulkDelete(amount);

    interaction.reply({
      content: `🧹 Eliminati ${amount} messaggi`,
      ephemeral: true
    });
  }
};
