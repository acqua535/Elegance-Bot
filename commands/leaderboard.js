const { SlashCommandBuilder } = require("discord.js");
const { load } = require("../utils/lbHelper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top partner & collab"),

  async execute(interaction) {
    const data = load();

    let list = Object.entries(data).map(([id, v]) => ({
      id,
      partner: v.partner || 0,
      collab: v.collab || 0,
      total: (v.partner || 0) + (v.collab || 0)
    }));

    list.sort((a, b) => b.total - a.total);
    list = list.slice(0, 10);

    if (list.length === 0) {
      return interaction.reply("📊 Nessun dato ancora.");
    }

    let text = list.map((u, i) =>
      `**${i + 1}.** <@${u.id}> — 🤝 ${u.partner} | ⚡ ${u.collab}`
    ).join("\n");

    interaction.reply({
      content: `📊 **Leaderboard Elegance**\n\n${text}`
    });
  }
};
