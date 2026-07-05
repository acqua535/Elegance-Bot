const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gameleaderboard")
    .setDescription("🎮 Classifica minigame"),

  async execute(interaction) {
    const data = load();

    const list = Object.entries(data.users || {}).map(([id, v]) => {
      return {
        id,
        wins: v.wins || 0,
        games: v.games || 0,
        winrate: v.games ? Math.round((v.wins / v.games) * 100) : 0
      };
    });

    list.sort((a, b) => b.wins - a.wins);
    const top = list.slice(0, 10);

    if (top.length === 0) {
      return interaction.reply({
        content: "🎮 Nessun dato minigame ancora.",
        ephemeral: true
      });
    }

    const text = top.map((u, i) => {
      return `**${i + 1}.** <@${u.id}>
🏆 Wins: **${u.wins}** | 🎮 Games: **${u.games}** | 📊 Winrate: **${u.winrate}%**`;
    }).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("🎮 Minigame Leaderboard")
      .setDescription(text)
      .setColor(0x2ECC71)
      .setFooter({ text: "Elegance Game System" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
