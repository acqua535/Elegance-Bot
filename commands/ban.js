const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banna un utente")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("Utente da bannare")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);

    await member.ban();

    interaction.reply(`🔨 ${user.tag} bannato`);
  }
};
