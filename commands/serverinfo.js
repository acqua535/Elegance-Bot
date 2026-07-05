const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("📊 Info server"),

  async execute(interaction) {
    const g = interaction.guild;
    const owner = await g.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${g.name}`)
      .setColor(0x5865F2)
      .setThumbnail(g.iconURL({ dynamic: true }))
      .addFields(
        { name: "ID", value: g.id, inline: true },
        { name: "Owner", value: owner.user.tag, inline: true },
        { name: "Membri", value: `${g.memberCount}`, inline: true },
        { name: "Canali", value: `${g.channels.cache.size}`, inline: true },
        {
          name: "Creato",
          value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`
        }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
