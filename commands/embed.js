const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("📦 Crea un embed")
    .addStringOption(o =>
      o.setName("title").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("description").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("color").setRequired(false)
    )
    .addStringOption(o =>
      o.setName("footer").setRequired(false)
    )
    .addStringOption(o =>
      o.setName("image").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const color = interaction.options.getString("color") || "#5865F2";
    const footer = interaction.options.getString("footer");
    const image = interaction.options.getString("image");

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (footer) embed.setFooter({ text: footer });
    if (image) embed.setImage(image);

    await interaction.reply({
      content: "✅ Embed creato",
      ephemeral: true
    });

    await interaction.channel.send({ embeds: [embed] });
  }
};
