const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Crea un embed personalizzato")

    .addStringOption(option =>
      option
        .setName("title")
        .setDescription("Titolo dell'embed")
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName("description")
        .setDescription("Descrizione dell'embed")
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Colore HEX (es: #5865F2)")
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName("footer")
        .setDescription("Testo del footer")
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName("image")
        .setDescription("URL immagine")
        .setRequired(false)
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

    if (footer) {
      embed.setFooter({ text: footer });
    }

    if (image) {
      embed.setImage(image);
    }

    await interaction.reply({
      content: "✅ Embed inviato!",
      ephemeral: true
    });

    await interaction.channel.send({
      embeds: [embed]
    });

  }
};
