const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top partner & collab"),

  async execute(interaction) {
    const data = load();

    let list = Object.entries(data).map(([id, v]) => {
      const partner = v.partner || 0;
      const collab = v.collab || 0;

      return {
        id,
        partner,
        collab,
        total: partner + collab
      };
    });

    list.sort((a, b) => b.total - a.total);
    list = list.slice(0, 10);

    if (list.length === 0) {
      return interaction.reply({
        content: "📊 Nessun dato ancora.",
        ephemeral: true
      });
    }

    const medals = ["🥇", "🥈", "🥉"];

    const description = list.map((u, i) => {
      const medal = medals[i] || `#${i + 1}`;

      return `${medal} <@${u.id}>  
🤝 Partner: **${u.partner}** | ⚡ Collab: **${u.collab}** | 🏆 Totale: **${u.total}**`;
    }).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Elegance Leaderboard")
      .setDescription(description)
      .setColor(0xF1C40F)
      .setTimestamp()
      .setFooter({ text: "Top Users System" });

    await interaction.reply({ embeds: [embed] });
  }
};
