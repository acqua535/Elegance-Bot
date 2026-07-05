const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

// ==========================
// RANK GAME
// ==========================
function getGameRank(wins) {
  if (wins >= 50) return { name: "💎 Game Master", color: 0x9B59B6 };
  if (wins >= 30) return { name: "🥇 Pro Player", color: 0xF1C40F };
  if (wins >= 15) return { name: "🥈 Skilled", color: 0xBDC3C7 };
  return { name: "🥉 Rookie", color: 0xCD7F32 };
}

// ==========================
// BADGE
// ==========================
function getBadge(pos) {
  if (pos === 0) return "👑";
  if (pos === 1) return "🔥";
  if (pos === 2) return "⚡";
  return "✨";
}

// ==========================
// COMMAND
// ==========================
module.exports = {
  data: new SlashCommandBuilder()
    .setName("gameleaderboard")
    .setDescription("🎮 Leaderboard minigame PRO"),

  async execute(interaction) {
    const data = load();

    let list = Object.entries(data)
      .map(([id, v]) => {
        const wins = v.wins || 0;
        const games = v.games || 0;

        const winrate = games > 0 ? Math.round((wins / games) * 100) : 0;

        return {
          id,
          wins,
          games,
          winrate
        };
      })
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setTitle("🎮 Elegance Game Leaderboard PRO")
      .setTimestamp();

    const description = list.length
      ? list.map((u, i) => {
          const rank = getGameRank(u.wins);
          const badge = getBadge(i);

          return (
            `**${i + 1}. ${badge} <@${u.id}>**\n` +
            `🏅 Rank: **${rank.name}**\n` +
            `🏆 Wins: **${u.wins}** | 🎮 Games: **${u.games}**\n` +
            `📊 Winrate: **${u.winrate}%**\n`
          );
        }).join("\n")
      : "Nessun dato disponibile.";

    embed.setDescription(description);

    // colore TOP 1
    if (list[0]) {
      embed.setColor(getGameRank(list[0].wins).color);
    } else {
      embed.setColor(0x2ECC71);
    }

    return interaction.reply({ embeds: [embed] });
  }
};
