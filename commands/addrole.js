const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aggiungi-ruolo")
    .setDescription("Aggiunge un ruolo a un utente")
    .addUserOption(o =>
      o.setName("user").setDescription("utente").setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("role").setDescription("ruolo").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");

    const member = await interaction.guild.members.fetch(user.id);

    await member.roles.add(role);

    interaction.reply(`➕ Ruolo ${role.name} aggiunto a ${user.tag}`);
  }
};
