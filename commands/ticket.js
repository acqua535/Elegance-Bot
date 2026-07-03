const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

// 👇 CATEGORIE (LE TUE)
const CATEGORIES = {
  support: "1522720225664176128",
  partner: "1522719621889789992",
  collab: "1522719710162980884",
  staff: "1522719774226907227"
};

const STAFF_ROLES = [
  "1505192964769714287",
  "1505192718068879430"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("🎫 Sistema Ticket Elegance PRO")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Elegance Ticket System")
      .setDescription(
        "Seleziona il tipo di richiesta:\n\n" +
        "🎫 Support\n" +
        "🤝 Partner\n" +
        "⚡ Collab\n" +
        "🛡️ Staff Bando"
      )
      .setColor(0x2ECC71)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_support")
        .setLabel("Support")
        .setEmoji("🎫")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("ticket_partner")
        .setLabel("Partner")
        .setEmoji("🤝")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("ticket_collab")
        .setLabel("Collab")
        .setEmoji("⚡")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("ticket_staff")
        .setLabel("Staff")
        .setEmoji("🛡️")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  },

  async buttonHandler(interaction) {
    const userId = interaction.user.id;

    const existing = interaction.guild.channels.cache.find(
      c => c.name.includes(userId)
    );

    if (existing) {
      return interaction.reply({
        content: "❌ Hai già un ticket aperto!",
        ephemeral: true
      });
    }

    let type = "support";

    if (interaction.customId === "ticket_partner") type = "partner";
    if (interaction.customId === "ticket_collab") type = "collab";
    if (interaction.customId === "ticket_staff") type = "staff";

    const channel = await interaction.guild.channels.create({
      name: `ticket-${type}-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      type: ChannelType.GuildText,
      parent: CATEGORIES[type],
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ["ViewChannel"]
        },
        {
          id: userId,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
        },
        ...STAFF_ROLES.map(roleId => ({
          id: roleId,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
        }))
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket ${type.toUpperCase()}`)
      .setDescription(
        type === "staff"
          ? "🛡️ Candidatura staff aperta. Lo staff ti valuterà presto."
          : "Lo staff ti risponderà il prima possibile."
      )
      .setColor(
        type === "partner"
          ? 0x5865F2
          : type === "collab"
          ? 0x9B59B6
          : type === "staff"
          ? 0xE74C3C
          : 0x3498DB
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Chiudi Ticket")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: `✅ Ticket creato: ${channel}`,
      ephemeral: true
    });
  },

  async closeHandler(interaction) {
    if (interaction.customId !== "ticket_close") return;

    await interaction.reply("🔒 Chiusura ticket...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }
};
