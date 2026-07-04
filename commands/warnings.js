const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const file = "./utils/warns.json";

function load() {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Mostra i warn di un utente")
    .addUserOption(o => o.setName("user").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const data = load();

    const warns = data[user.id] || [];

    if (warns.length === 0) {
      return interaction.reply({
        content: "✅ Nessun warn",
        ephemeral: true
      });
    }

    const list = warns.map((w, i) =>
      `**${i + 1}.** ${w.reason} — ${w.moderator}`
    ).join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warn di ${user.tag}`)
      .setDescription(list)
      .setColor(0xFEE75C);

    return interaction.reply({ embeds: [embed] });
  }
};
