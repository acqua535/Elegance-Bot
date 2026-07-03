const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const SUPPORT_CATEGORY = "1522720225664176128";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("🎫 Apri un ticket supporto"),

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
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  },

  async buttonHandler(interaction) {
    try {
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

      const channel = await interaction.guild.channels.create({
        name: `ticket-${user.username}-${user.id}`,
        type: ChannelType.GuildText,
        parent: SUPPORT_CATEGORY,
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
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket Supporto")
        .setDescription(`Ciao ${user}, descrivi il tuo problema.`)
        .setColor(0x00AEEF);

      await channel.send({
        content: `<@${user.id}>`,
        embeds: [embed]
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
  }
};
