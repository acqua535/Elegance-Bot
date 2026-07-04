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
    .setDescription("🏆 Classifica minigame"),

  async execute(interaction) {
    const data = load();

    let list = Object.entries(data).map(([id, v]) => ({
      id,
      wins: v.wins || 0,
      games: v.games || 0
    }));

    list.sort((a, b) => b.wins - a.wins);
    list = list.slice(0, 10);

    if (list.length === 0) {
      return interaction.reply({
        content: "📊 Nessun dato ancora.",
        ephemeral: true
      });
    }

    const text = list.map((u, i) => {
      const winrate = u.games
        ? Math.round((u.wins / u.games) * 100)
        : 0;

      return `**${i + 1}.** <@${u.id}>
🏆 Wins: **${u.wins}** | 🎮 Games: **${u.games}** | 📊 Winrate: **${winrate}%**`;
    }).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Leaderboard Minigame")
      .setDescription(text)
      .setColor(0xF1C40F)
      .setFooter({ text: "Elegance Game System" });

    return interaction.reply({ embeds: [embed] });
  }
};
