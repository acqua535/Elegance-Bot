module.exports = {
  name: "ping",
  description: "🏓 Ping bot",

  async execute(interaction, client) {
    const msg = await interaction.reply({ content: "🏓 Calcolo...", fetchReply: true });

    const botPing = msg.createdTimestamp - interaction.createdTimestamp;
    const apiPing = client.ws.ping;

    return interaction.editReply(
      `🏓 Pong!\n📡 Bot: ${botPing}ms\n🤖 API: ${apiPing}ms`
    );
  }
};
