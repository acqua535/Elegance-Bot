const { SlashCommandBuilder } = require("discord.js");

let lastGame = null;

const games = ["coinflip", "rps", "number"];

function pickGame() {
  let filtered = games.filter(g => g !== lastGame);
  let game = filtered[Math.floor(Math.random() * filtered.length)];
  lastGame = game;
  return game;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minigame")
    .setDescription("Gioco casuale"),

  async execute(interaction) {
    const game = pickGame();

    if (game === "coinflip") {
      return interaction.reply(Math.random() < 0.5 ? "🪙 TESTA" : "🪙 CROCE");
    }

    if (game === "rps") {
      const arr = ["sasso", "carta", "forbice"];
      return interaction.reply(`🎮 ${arr[Math.floor(Math.random() * 3)]}`);
    }

    return interaction.reply("🎲 numero: " + Math.floor(Math.random() * 10));
  }
};
