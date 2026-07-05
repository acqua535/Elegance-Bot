  const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 Info utente")
    .addUserOption(o => o.setName("user")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    let member;
    try {
      member = await interaction.guild.members.fetch(user.id);
    } catch {
      member = null;
    }

    const roles = member
      ? member.roles.cache
          .filter(r => r.name !== "@everyone")
          .map(r => r.toString())
          .join(", ") || "Nessun ruolo"
      : "Non nel server";

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.tag}`)
      .setColor(user.bot ? 0xED4245 : 0x5865F2)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "ID", value: user.id, inline: true },
        { name: "Bot", value: user.bot ? "Sì" : "No", inline: true },
        {
          name: "Account creato",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`
        },
        {
          name: "Entrato",
          value: member
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
            : "Non nel server"
        },
        {
          name: "Ruoli",
          value: roles.length > 1024 ? "Troppi ruoli" : roles
        }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
