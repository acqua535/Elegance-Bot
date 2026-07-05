const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("😂 Meme casuale da Reddit"),

  async execute(interaction) {
    try {
      const res = await fetch("https://meme-api.com/gimme");
      const data = await res.json();

      const embed = new EmbedBuilder()
        .setTitle(`😂 ${data.title}`)
        .setImage(data.url)
        .setColor(0x2B2D31)
        .setFooter({ text: `r/${data.subreddit}` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Errore caricamento meme",
        ephemeral: true
      });
    }
  }
};
