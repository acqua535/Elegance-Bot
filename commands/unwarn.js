const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const file = "./utils/warns.json";

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Rimuove un warn da un utente")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Utente a cui rimuovere il warn")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("index")
        .setDescription("Numero del warn da rimuovere (1, 2, 3...)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      const index = interaction.options.getInteger("index") - 1;

      const data = load();

      if (!data[user.id] || data[user.id].length === 0) {
        return interaction.reply({
          content: "❌ Questo utente non ha warn.",
          ephemeral: true
        });
      }

      if (index < 0 || index >= data[user.id].length) {
        return interaction.reply({
          content: "❌ Index non valido.",
          ephemeral: true
        });
      }

      const removed = data[user.id].splice(index, 1)[0];
      save(data);

      const embed = new EmbedBuilder()
        .setTitle("🧹 Warn rimosso")
        .setDescription(`Un warn è stato rimosso da <@${user.id}>`)
        .addFields(
          { name: "📌 Motivo rimosso", value: removed?.reason || "N/A" },
          { name: "🔢 Index", value: `${index + 1}`, inline: true }
        )
        .setColor(0xF1C40F)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore durante rimozione warn",
        ephemeral: true
      });
    }
  }
};
