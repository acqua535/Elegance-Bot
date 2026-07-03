const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

const file = "./utils/warns.json";

function load() {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Mostra i warn di un utente")
    .addUserOption(o =>
      o.setName("user").setDescription("utente").setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const data = load();

    const warns = data[user.id];

    if (!warns || warns.length === 0) {
      return interaction.reply(`✅ ${user.tag} non ha warn`);
    }

    let text = warns
      .map((w, i) => `${i + 1}. ${w.reason} (da ${w.moderator})`)
      .join("\n");

    interaction.reply(`⚠️ Warn di ${user.tag}:\n\n${text}`);
  }
};
