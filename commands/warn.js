const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const file = "./utils/warns.json";

function load() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
  return JSON.parse(fs.readFileSync(file));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Dai un warn a un utente")
    .addUserOption(o =>
      o.setName("user").setDescription("utente").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason").setDescription("motivo").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const data = load();

    if (!data[user.id]) data[user.id] = [];

    data[user.id].push({
      reason,
      moderator: interaction.user.tag,
      date: new Date().toISOString()
    });

    save(data);

    interaction.reply(`⚠️ ${user.tag} ha ricevuto un warn\nMotivo: ${reason}`);
  }
};
