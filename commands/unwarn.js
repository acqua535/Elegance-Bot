const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const file = "./utils/warns.json";

function load() {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Rimuove un warn")
    .addUserOption(o =>
      o.setName("user").setDescription("utente").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("index").setDescription("numero warn").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const index = interaction.options.getInteger("index") - 1;

    const data = load();

    if (!data[user.id] || !data[user.id][index]) {
      return interaction.reply("❌ Warn non trovato");
    }

    data[user.id].splice(index, 1);
    save(data);

    interaction.reply(`🧹 Warn rimosso da ${user.tag}`);
  }
};
