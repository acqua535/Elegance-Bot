const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const PARTNER_CHANNEL = "1508774443286003815";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("partner")
    .setDescription("Richiesta partner"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🤝 Partner Request")
      .setDescription(`Utente: ${interaction.user.tag}`)
      .setColor("Blue");

    const channel = interaction.guild.channels.cache.get(PARTNER_CHANNEL);
    if (channel) channel.send({ embeds: [embed] });

    interaction.reply({ content: "📨 richiesta inviata", ephemeral: true });
  }
};
