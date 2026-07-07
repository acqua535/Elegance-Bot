const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

// ================= STAFF ROLES =================
const STAFF_ROLES = [
  "1505193231674249396",
  "1505193131790962698",
  "1505192718068879430"
];

// ================= OWNER =================
const OWNER_ID = "1505192718068879430";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("🎫 Sistema ticket semplice e stabile"),

  async execute(interaction) {

    // SOLO OWNER
    if (!interaction.member.roles.cache.has(OWNER_ID)) {
      return interaction.reply({
        content: "❌ Solo l'owner può usare questo comando.",
        ephemeral: true
      });
    }

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
    try {

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
        .setDescription(`Ciao <@${interaction.user.id}>, scrivi il tuo problema.`)
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
    try {

      await interaction.reply({
        content: "🔒 Ticket chiuso...",
        ephemeral: true
      });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 2000);

    } catch (err) {
      console.error(err);
    }
  }
};
