const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🏓 Mostra latenza bot"),

  async execute(interaction) {
    const msg = await interaction.reply({
      content: "🏓 Ping in corso...",
      fetchReply: true
    });

    const latency = msg.createdTimestamp - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .addFields(
        { name: "📡 Latency", value: `${latency}ms`, inline: true },
        { name: "🤖 API", value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
      )
      .setColor(0x5865F2);

    return interaction.editReply({ content: null, embeds: [embed] });
  }
};
