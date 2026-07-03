const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aggiungi-ruolo")
    .setDescription("Aggiunge un ruolo a un utente del server")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Utente a cui aggiungere il ruolo")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Ruolo da assegnare all'utente")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");

    const member = await interaction.guild.members.fetch(user.id);

    await member.roles.add(role);

    await interaction.reply({
      content: `➕ Ruolo **${role.name}** aggiunto a **${user.tag}**`,
      ephemeral: true
    });
  }
};
