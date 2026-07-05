const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { isStaff } = require("../utils/staff");

const FILE = "./utils/warns.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("🧹 Rimuove un warn")
    .addUserOption(o =>
      o.setName("user").setDescription("Utente").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("index")
        .setDescription("Numero warn (1,2,3...)")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: "❌ Non hai permessi.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user");
    const index = interaction.options.getInteger("index") - 1;

    const data = load();

    if (!data[user.id] || data[user.id].length === 0) {
      return interaction.reply({
        content: "❌ Nessun warn trovato",
        ephemeral: true
      });
    }

    if (index < 0 || index >= data[user.id].length) {
      return interaction.reply({
        content: "❌ Index non valido",
        ephemeral: true
      });
    }

    const removed = data[user.id].splice(index, 1);
    save(data);

    const embed = new EmbedBuilder()
      .setTitle("🧹 WARN RIMOSSO")
      .setColor(0x57F287)
      .setDescription(`✔ Rimosso warn da **${user.tag}**`)
      .addFields(
        { name: "📌 Motivo rimosso", value: removed[0].reason },
        { name: "👮 Staff", value: interaction.user.tag },
        { name: "📊 Warn rimasti", value: `${data[user.id].length}` }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
