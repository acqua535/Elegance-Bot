const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Espelle un utente dal server")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Utente da kickare")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    if (!user) {
      return interaction.reply({
        content: "❌ Utente non valido",
        ephemeral: true
      });
    }

    try {
      const member = await interaction.guild.members.fetch(user.id);

      if (!member) {
        return interaction.reply({
          content: "❌ Utente non trovato nel server",
          ephemeral: true
        });
      }

      await member.kick();

      return interaction.reply({
        content: `👢 ${user.tag} è stato espulso`,
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore durante il kick",
        ephemeral: true
      });
    }
  }
};
