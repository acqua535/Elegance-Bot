const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("🏆 Classifica partner + collab"),

  async execute(interaction) {
    const data = load();

    const list = Object.entries(data)
      .map(([id, v]) => ({
        id,
        partner: v.partner || 0,
        collab: v.collab || 0,
        total: (v.partner || 0) + (v.collab || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const text = list.length
      ? list.map((u, i) =>
          `**${i + 1}.** <@${u.id}> 🤝 ${u.partner} | ⚡ ${u.collab} | 🏆 ${u.total}`
        ).join("\n")
      : "Nessun dato disponibile.";

    const embed = new EmbedBuilder()
      .setTitle("🏆 Elegance Social Leaderboard")
      .setDescription(text)
      .setColor(0xF1C40F)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
