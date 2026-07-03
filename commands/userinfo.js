const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Info utente")
    .addUserOption(o =>
      o.setName("user").setDescription("utente").setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    interaction.reply(`👤 ${user.tag}\n🆔 ${user.id}`);
  }
};
