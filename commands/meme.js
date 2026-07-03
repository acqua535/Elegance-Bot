const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Meme casuale"),

  async execute(interaction) {
    try {
      const res = await fetch("https://meme-api.com/gimme");
      const data = await res.json();

      interaction.reply({
        content: `${data.title}\n${data.url}`
      });

    } catch (err) {
      interaction.reply("❌ Errore nel caricamento meme");
    }
  }
};
