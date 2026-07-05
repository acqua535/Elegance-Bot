const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

// ==========================
// LIVELLI
// ==========================
function getRank(total) {
  if (total >= 50) return { name: "💎 Diamond", color: 0x9B59B6 };
  if (total >= 30) return { name: "🥇 Gold", color: 0xF1C40F };
  if (total >= 15) return { name: "🥈 Silver", color: 0xBDC3C7 };
  return { name: "🥉 Bronze", color: 0xCD7F32 };
}

// ==========================
// BADGE
// ==========================
function getBadge(position) {
  if (position === 0) return "👑";
  if (position === 1) return "🔥";
  if (position === 2) return "⚡";
  return "✨";
}

// ==========================
// COMMAND
// ==========================
module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("🏆 Social leaderboard PRO"),

  async execute(interaction) {
    const data = load();

    let list = Object.entries(data)
      .map(([id, v]) => {
        const partner = v.partner || 0;
        const collab = v.collab || 0;
        const total = partner + collab;

        return {
          id,
          partner,
          collab,
          total,
          activity: v.games || 0
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setTitle("🏆 Elegance Social Leaderboard PRO")
      .setTimestamp();

    const description = list.length
      ? list.map((u, i) => {
          const rank = getRank(u.total);
          const badge = getBadge(i);

          // 📊 percent activity (semplice ma efficace)
          const activityPercent = u.total
            ? Math.min(100, Math.round((u.activity + u.total) * 2))
            : 0;

          return (
            `**${i + 1}. ${badge} <@${u.id}>**\n` +
            `🏅 Rank: **${rank.name}**\n` +
            `🤝 Partner: **${u.partner}** | ⚡ Collab: **${u.collab}**\n` +
            `📊 Activity: **${activityPercent}%**\n`
          );
        }).join("\n")
      : "Nessun dato disponibile.";

    embed.setDescription(description);

    // colore del TOP 1
    if (list[0]) {
      embed.setColor(getRank(list[0].total).color);
    } else {
      embed.setColor(0x2ECC71);
    }

    return interaction.reply({ embeds: [embed] });
  }
};
