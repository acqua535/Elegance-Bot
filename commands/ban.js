const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banna un utente dal server")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Utente da bannare")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    if (!user) {
      return interaction.reply({
        content: "❌ Utente non valido",
        ephemeral: true
      });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (!member) {
      return interaction.reply({
        content: "❌ Utente non trovato nel server",
        ephemeral: true
      });
    }

    await member.ban();

    await interaction.reply({
      content: `🔨 ${user.tag} è stato bannato`,
      ephemeral: true
    });
  }
};
