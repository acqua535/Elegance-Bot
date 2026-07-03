const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

// 👇 I TUOI RUOLI STAFF
const STAFF_ROLES = [
  "1505192964769714287",
  "1505192718068879430"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("🎫 Apri un ticket supporto"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket System")
      .setDescription("Premi il bottone per aprire un ticket.")
      .setColor(0x2ECC71);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("Apri Ticket")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎫")
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
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        ...STAFF_ROLES.map(role => ({
          id: role,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }))
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Aperto")
      .setDescription(`Ciao <@${interaction.user.id}>, descrivi il tuo problema.`)
      .setColor(0x3498DB);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Chiudi Ticket")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔒")
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

    await interaction.reply({
      content: "🔒 Ticket chiuso...",
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  }
};
