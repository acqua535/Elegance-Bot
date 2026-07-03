const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
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
    .setDescription("🎫 Apri il pannello ticket"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Sistema Ticket")
      .setDescription("Seleziona una categoria per aprire un ticket:")
      .setColor(0x2B2D31);

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
      components: [row],
      ephemeral: false
    });
  },

  async buttonHandler(interaction) {
    try {
      const user = interaction.user;

      // evita doppio ticket
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

      // crea canale
      const channel = await interaction.guild.channels.create({
        name: `ticket-${type}-${user.username.toLowerCase()}-${user.id}`,
        type: ChannelType.GuildText,
        parent: CATEGORIES[type],
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },
          ...STAFF_ROLES.map(role => ({
            id: role,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }))
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket ${type.toUpperCase()}`)
        .setDescription(`Ciao <@${user.id}>, descrivi il tuo problema.`)
        .setColor(0x00AEEF);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("🔒 Chiudi Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `<@${user.id}>`,
        embeds: [embed],
        components: [row]
      });

      // IMPORTANTISSIMO: risposta immediata
      await interaction.reply({
        content: `✅ Ticket creato: ${channel}`,
        ephemeral: true
      });

    } catch (err) {
      console.error("Ticket error:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Errore creazione ticket",
          ephemeral: true
        });
      }
    }
  },

  async closeHandler(interaction) {
    if (interaction.customId !== "ticket_close") return;

    await interaction.reply({
      content: "🔒 Ticket chiuso...",
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  }
};
