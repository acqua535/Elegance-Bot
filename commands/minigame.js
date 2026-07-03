const { SlashCommandBuilder } = require("discord.js");

let lastGame = null;

const games = ["coinflip", "rps", "number"];

function pickGame() {
  const filtered = games.filter(g => g !== lastGame);
  const game = filtered[Math.floor(Math.random() * filtered.length)];
  lastGame = game;
  return game;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minigame")
    .setDescription("Gioco casuale tra più minigame"),

  async execute(interaction) {
    try {
      const game = pickGame();

      if (game === "coinflip") {
        const result = Math.random() < 0.5 ? "🪙 TESTA" : "🪙 CROCE";
        return interaction.reply(result);
      }

      if (game === "rps") {
        const arr = ["sasso", "carta", "forbice"];
        const pick = arr[Math.floor(Math.random() * arr.length)];
        return interaction.reply(`🎮 RPS: ${pick}`);
      }

      const number = Math.floor(Math.random() * 10);
      return interaction.reply(`🎲 Numero: ${number}`);

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore minigame",
        ephemeral: true
      });
    }
  }
};
