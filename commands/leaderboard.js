const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { checkWeeklyReset } = require("../utils/resetStats");

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ start: Date.now(), users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("🏆 Classifica settimanale partner & collab"),

  async execute(interaction) {
    const data = checkWeeklyReset();

    const users = Object.entries(data.users || {}).map(([id, v]) => {
      const partner = v.partner || 0;
      const collab = v.collab || 0;

      return {
        id,
        partner,
        collab,
        total: partner + collab
      };
    });

    users.sort((a, b) => b.total - a.total);
    const top = users.slice(0, 10);

    if (top.length === 0) {
      return interaction.reply({
        content: "📊 Nessuna attività questa settimana ancora.",
        ephemeral: true
      });
    }

    const medals = ["🥇", "🥈", "🥉"];

    const description = top.map((u, i) => {
      const medal = medals[i] || `#${i + 1}`;

      return `${medal} <@${u.id}>
🤝 Partner: **${u.partner}** | ⚡ Collab: **${u.collab}** | 🏆 Totale: **${u.total}**`;
    }).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Weekly Leaderboard")
      .setDescription(description)
      .setColor(0xF1C40F)
      .setTimestamp()
      .setFooter({ text: "Reset automatico ogni 7 giorni" });

    return interaction.reply({ embeds: [embed] });
  }
};
