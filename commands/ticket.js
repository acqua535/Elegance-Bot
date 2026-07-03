const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const STAFF_ROLES = [
  "1505192964769714287",
  "1505192718068879430"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("🎫 Sistema Ticket Premium Elegance")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Supporto Elegance")
      .setDescription("Clicca il bottone qui sotto per aprire un ticket privato con lo staff.")
      .setColor(0x2ECC71)
      .setFooter({ text: "Elegance Ticket System" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("Apri Ticket")
        .setEmoji("🎫")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  },

  async buttonHandler(interaction) {
    if (interaction.customId !== "ticket_create") return;

    const existing = interaction.guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.id}`
    );

    if (existing) {
      return interaction.reply({
        content: "❌ Hai già un ticket aperto!",
        ephemeral: true
      });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ["ViewChannel"]
        },
        {
          id: interaction.user.id,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
        },
        ...STAFF_ROLES.map(roleId => ({
          id: roleId,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
        }))
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Aperto")
      .setDescription(
        `👋 Ciao ${interaction.user}!\n\nLo staff ti risponderà il prima possibile.\nUsa il bottone sotto per chiudere il ticket.`
      )
      .setColor(0x3498DB)
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

    await interaction.reply("🔒 Chiusura ticket in corso...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }
};
