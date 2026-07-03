const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Mostra informazioni dettagliate del server"),

  async execute(interaction) {
    const g = interaction.guild;

    const owner = await g.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(`📊 Server Info - ${g.name}`)
      .setThumbnail(g.iconURL({ dynamic: true }))
      .setColor(0x5865F2)
      .addFields(
        { name: "🆔 Server ID", value: g.id, inline: true },
        { name: "👑 Owner", value: `${owner.user.tag}`, inline: true },
        { name: "👥 Membri totali", value: `${g.memberCount}`, inline: true },
        { name: "💬 Canali", value: `${g.channels.cache.size}`, inline: true },
        { name: "📅 Creato il", value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`, inline: false },
        { name: "🌐 Regione", value: `${g.preferredLocale || "N/A"}`, inline: true }
      )
      .setFooter({ text: "Elegance System • Server Info" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
