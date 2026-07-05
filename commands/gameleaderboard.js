const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gameleaderboard")
    .setDescription("🎮 Classifica minigame"),

  async execute(interaction) {
    const data = load();

    const list = Object.entries(data)
      .map(([id, v]) => ({
        id,
        wins: v.wins || 0,
        games: v.games || 0,
        winrate: v.games ? Math.round((v.wins / v.games) * 100) : 0
      }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);

    const text = list.length
      ? list.map((u, i) =>
          `**${i + 1}.** <@${u.id}> 🏆 ${u.wins} win | 🎮 ${u.games} games | 📊 ${u.winrate}%`
        ).join("\n")
      : "Nessun dato disponibile.";

    const embed = new EmbedBuilder()
      .setTitle("🎮 Minigame Leaderboard")
      .setDescription(text)
      .setColor(0x2ECC71)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
