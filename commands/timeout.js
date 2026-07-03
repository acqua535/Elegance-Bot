const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Metti timeout a un utente")
    .addUserOption(opt =>
      opt.setName("user").setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("minutes").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(minutes * 60 * 1000);

    interaction.reply(`⏱️ ${user.tag} in timeout per ${minutes} min`);
  }
};
