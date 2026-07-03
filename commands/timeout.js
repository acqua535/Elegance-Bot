const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Metti un utente in timeout")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Utente da mettere in timeout")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutes")
        .setDescription("Durata del timeout in minuti")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(minutes * 60 * 1000);

    await interaction.reply({
      content: `⏱️ ${user.tag} è stato messo in timeout per ${minutes} minuti.`,
      ephemeral: true
    });
  }
};
