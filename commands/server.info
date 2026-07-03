const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Info server"),

  async execute(interaction) {
    const g = interaction.guild;

    interaction.reply(`📊 ${g.name}\n👥 Membri: ${g.memberCount}`);
  }
};
