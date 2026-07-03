const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require("discord.js");

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
    .setDescription("🎫 Sistema Ticket Elegance"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket System")
      .setDescription("Seleziona una categoria:")
      .setColor(0x2ECC71);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_support")
        .setLabel("Support")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("ticket_partner")
        .setLabel("Partner")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("ticket_collab")
        .setLabel("Collab")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("ticket_staff")
        .setLabel("Staff")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  },

  async buttonHandler(interaction) {
    const user = interaction.user;

    const existing = interaction.guild.channels.cache.find(
      c => c.name.includes(user.id)
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
      name: `ticket-${type}-${user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      type: ChannelType.GuildText,
      parent: CATEGORIES[type],
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ["ViewChannel"]
        },
        {
          id: user.id,
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
      .setDescription(`Ciao ${user}, lo staff ti risponderà presto.`)
      .setColor(0x3498DB);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Chiudi Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${user.id}>`,
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
