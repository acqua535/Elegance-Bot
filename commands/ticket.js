const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");

const STAFF_ROLES = [
  "1505192964769714287",
  "1505192718068879430"
];

const LOG_CHANNEL_ID = "1505261606483923105";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("🎫 Sistema ticket Elegance")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  // ================= PANEL =================
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Support Ticket")
      .setDescription("Premi il bottone per aprire un ticket.")
      .setColor(0x2ECC71);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("Apri Ticket")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎫")
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },

  // ================= OPEN =================
  async open(interaction) {
    try {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ["ViewChannel"]
          },
          {
            id: interaction.user.id,
            allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
          },
          ...STAFF_ROLES.map(role => ({
            id: role,
            allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
          }))
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket Aperto")
        .setDescription("Lo staff ti assisterà presto.")
        .setColor(0x3498db);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_take")
          .setLabel("Prendi in carico")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Chiudi Ticket")
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

      this.log(interaction.guild, `🎫 OPEN | ${interaction.user.tag} | ${channel.name}`);

    } catch (err) {
      console.error("Ticket open error:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Errore creazione ticket",
          ephemeral: true
        });
      }
    }
  },

  // ================= TAKE =================
  async take(interaction) {
    try {
      await interaction.reply({
        content: `👮 ${interaction.user.tag} ha preso in carico il ticket.`
      });

      this.log(interaction.guild, `👮 TAKE | ${interaction.user.tag} | ${interaction.channel.name}`);

    } catch (err) {
      console.error("Ticket take error:", err);
    }
  },

  // ================= CLOSE =================
  async close(interaction) {
    try {
      await interaction.reply("🔒 Chiusura ticket...");

      this.log(interaction.guild, `🔒 CLOSE | ${interaction.user.tag} | ${interaction.channel.name}`);

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 2500);

    } catch (err) {
      console.error("Ticket close error:", err);
    }
  },

  // ================= LOG SYSTEM =================
  log(guild, text) {
    try {
      const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (!logChannel) return;

      logChannel.send(`🧾 ${text}`).catch(() => {});
    } catch (e) {
      console.error("Log error:", e);
    }
  }
};
