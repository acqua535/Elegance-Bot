const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Crea un embed")
    .addStringOption(o =>
      o.setName("text").setDescription("contenuto").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const text = interaction.options.getString("text");

    const embed = new EmbedBuilder()
      .setDescription(text)
      .setColor("Blue");

    interaction.reply({ embeds: [embed] });
  }
};
