const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/warns.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("📊 Mostra warn utente")
    .addUserOption(o =>
      o.setName("user").setDescription("Utente").setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const data = load();

    const warns = data[user.id] || [];

    if (warns.length === 0) {
      return interaction.reply({
        content: `✅ **${user.tag}** non ha warn.`,
        ephemeral: true
      });
    }

    const list = warns.map((w, i) =>
      `**${i + 1}.** ⚠️ ${w.reason} — 👮 ${w.moderator}`
    ).join("\n");

    const embed = new EmbedBuilder()
      .setTitle("📊 WARN LIST")
      .setColor(0xFEE75C)
      .setDescription(`👤 ${user.tag}`)
      .addFields({
        name: "📌 Lista Warn",
        value: list
      });

    return interaction.reply({ embeds: [embed] });
  }
};
