const { SlashCommandBuilder } = require("discord.js");
const { load } = require("../utils/lbHelper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Mostra la classifica partner e collab"),

  async execute(interaction) {
    try {
      const data = load() || {};

      let list = Object.entries(data).map(([id, v]) => ({
        id,
        partner: v?.partner || 0,
        collab: v?.collab || 0,
        total: (v?.partner || 0) + (v?.collab || 0)
      }));

      list.sort((a, b) => b.total - a.total);
      list = list.slice(0, 10);

      if (list.length === 0) {
        return interaction.reply({
          content: "📊 Nessun dato ancora.",
          ephemeral: true
        });
      }

      const text = list.map((u, i) =>
        `**${i + 1}.** <@${u.id}> — 🤝 ${u.partner} | ⚡ ${u.collab}`
      ).join("\n");

      return interaction.reply({
        content: `📊 **Leaderboard Elegance**\n\n${text}`
      });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore leaderboard",
        ephemeral: true
      });
    }
  }
};
