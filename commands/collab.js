const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const COLLAB_CHANNEL = "1522610038831845518";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collab")
    .setDescription("Richiesta collab"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("⚡ Collab Request")
      .setDescription(`Utente: ${interaction.user.tag}`)
      .setColor("Purple");

    const channel = interaction.guild.channels.cache.get(COLLAB_CHANNEL);
    if (channel) channel.send({ embeds: [embed] });

    interaction.reply({ content: "📨 collab inviata", ephemeral: true });
  }
};
