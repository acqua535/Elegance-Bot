const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("📊 Info dettagliate server"),

  async execute(interaction) {
    const g = interaction.guild;
    const owner = await g.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(`📊 Server Overview`)
      .setThumbnail(g.iconURL({ dynamic: true }))
      .setColor(0x5865F2)
      .addFields(

        { name: "🏷️ Nome", value: g.name, inline: true },
        { name: "🆔 ID", value: g.id, inline: true },
        { name: "👑 Owner", value: owner.user.tag, inline: true },

        {
          name: "👥 Membri",
          value: `Totale: ${g.memberCount}`,
          inline: true
        },

        {
          name: "💬 Canali",
          value: `${g.channels.cache.size}`,
          inline: true
        },

        {
          name: "📅 Creato il",
          value: `<t:${Math.floor(g.createdTimestamp / 1000)}:F>`,
          inline: false
        },

        {
          name: "🌍 Lingua",
          value: g.preferredLocale || "N/A",
          inline: true
        },

        {
          name: "🔐 Livello sicurezza",
          value: `${g.verificationLevel}`,
          inline: true
        },

        {
          name: "📦 Boost",
          value: `${g.premiumSubscriptionCount || 0}`,
          inline: true
        }
      )
      .setFooter({ text: "Elegance System • Server Info" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
