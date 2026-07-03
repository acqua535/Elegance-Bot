const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Crea un embed personalizzato")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Contenuto dell'embed")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const text = interaction.options.getString("text");

    const embed = new EmbedBuilder()
      .setDescription(text)
      .setColor(0x3498db) // 🔵 blu HEX stabile
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
