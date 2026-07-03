const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Meme casuale da Reddit"),

  async execute(interaction) {
    try {
      const res = await fetch("https://meme-api.com/gimme");

      if (!res.ok) {
        return interaction.reply({
          content: "❌ Errore API meme",
          ephemeral: true
        });
      }

      const data = await res.json();

      return interaction.reply({
        content: `😂 **${data.title}**\n${data.url}`
      });

    } catch (err) {
      console.error(err);

      if (interaction.replied || interaction.deferred) return;

      return interaction.reply({
        content: "❌ Errore nel caricamento meme",
        ephemeral: true
      });
    }
  }
};
