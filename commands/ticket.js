const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const STAFF_ROLE_ID = "1505192718068879430" "1505192964769714287"; // ruolo staff (UNO SOLO per semplicità)

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("🎫 Sistema ticket semplice e stabile"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Support Ticket")
      .setDescription("Premi il bottone per aprire un ticket privato.")
      .setColor(0x2ECC71);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
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
    if (interaction.customId !== "create_ticket") return;

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
        {
          id: STAFF_ROLE_ID,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Aperto")
      .setDescription(`Ciao ${interaction.user}, scrivi il tuo problema.`)
      .setColor(0x3498DB);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
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
    if (interaction.customId !== "close_ticket") return;

    await interaction.reply("🔒 Ticket chiuso...");

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  }
};
