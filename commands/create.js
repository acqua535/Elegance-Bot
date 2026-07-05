const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("🧩 Staff creation system")
    .addStringOption(o =>
      o.setName("type")
        .setDescription("Cosa vuoi creare?")
        .setRequired(true)
        .addChoices(
          { name: "📢 Announcement", value: "announcement" },
          { name: "🧷 Embed", value: "embed" },
          { name: "🔔 Alert", value: "alert" },
          { name: "📊 System", value: "system" },
          { name: "🤝 Partner (STAFF)", value: "partner" },
          { name: "⚡ Collab (STAFF)", value: "collab" },
          { name: "🎫 Ticket Panel", value: "ticket" }
        )
    )
    .addStringOption(o =>
      o.setName("text")
        .setDescription("Contenuto messaggio")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("title")
        .setDescription("Titolo (embed/announcement)")
        .setRequired(false)
    )
    .addStringOption(o =>
      o.setName("color")
        .setDescription("Colore HEX")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const type = interaction.options.getString("type");
    const text = interaction.options.getString("text");
    const title = interaction.options.getString("title") || "📢 Message";
    const color = interaction.options.getString("color") || "#5865F2";

    // 🔒 STAFF CHECK EXTRA
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: "❌ Solo staff può usare /create",
        ephemeral: true
      });
    }

    // 📢 ANNOUNCEMENT
    if (type === "announcement") {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(text)
        .setColor(color)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      return interaction.reply({ content: "📢 Announcement creato.", ephemeral: true });
    }

    // 🧷 EMBED
    if (type === "embed") {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(text)
        .setColor(color)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      return interaction.reply({ content: "🧷 Embed creato.", ephemeral: true });
    }

    // 🔔 ALERT
    if (type === "alert") {
      const embed = new EmbedBuilder()
        .setTitle("🚨 ALERT")
        .setDescription(text)
        .setColor(0xED4245)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      return interaction.reply({ content: "🔔 Alert inviato.", ephemeral: true });
    }

    // 📊 SYSTEM
    if (type === "system") {
      await interaction.channel.send({
        content: `📊 SYSTEM: ${text}`
      });

      return interaction.reply({ content: "📊 System message inviato.", ephemeral: true });
    }

    // 🤝 PARTNER STAFF
    if (type === "partner") {
      const embed = new EmbedBuilder()
        .setTitle("🤝 PARTNER UFFICIALE")
        .setDescription(text)
        .setColor(0x5865F2)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      return interaction.reply({ content: "🤝 Partner creato.", ephemeral: true });
    }

    // ⚡ COLLAB STAFF
    if (type === "collab") {
      const embed = new EmbedBuilder()
        .setTitle("⚡ COLLAB UFFICIALE")
        .setDescription(text)
        .setColor(0x9B59B6)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      return interaction.reply({ content: "⚡ Collab creato.", ephemeral: true });
    }

    // 🎫 TICKET PANEL
    if (type === "ticket") {
      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket System")
        .setDescription(text)
        .setColor(0x5865F2);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("create_ticket")
          .setLabel("🎫 Apri Ticket")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({ content: "🎫 Ticket panel creato.", ephemeral: true });
    }
  }
};
