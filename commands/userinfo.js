const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 Info dettagliate utente")
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
      : [];

    const embed = new EmbedBuilder()
      .setTitle(`👤 User Profile`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(user.bot ? 0xED4245 : 0x5865F2)
      .addFields(
        { name: "📛 Tag", value: user.tag, inline: true },
        { name: "🆔 ID", value: user.id, inline: true },
        { name: "🤖 Bot", value: user.bot ? "Sì" : "No", inline: true },

        {
          name: "📅 Account creato",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: false
        },

        {
          name: "📥 Entrato nel server",
          value: member
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
            : "❌ Non nel server",
          inline: false
        },

        {
          name: "🎭 Ruoli",
          value: roles.length ? roles.join(", ") : "Nessun ruolo",
          inline: false
        },

        {
          name: "📊 Statistiche",
          value: member
            ? `👑 Ruoli: ${roles.length}\n📌 Status: ${member.presence?.status || "offline"}`
            : "Non disponibili",
          inline: false
        }
      )
      .setFooter({ text: "Elegance System • User Info" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
