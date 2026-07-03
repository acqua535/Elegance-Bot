const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const file = "./utils/warns.json";

function load() {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function save(data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Errore salvataggio warns:", err);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Dai un warn a un utente")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Utente da warnare")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Motivo del warn")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");

      const data = load();

      if (!data[user.id]) data[user.id] = [];

      const warnData = {
        reason,
        moderator: interaction.user.tag,
        date: new Date().toISOString()
      };

      data[user.id].push(warnData);
      save(data);

      const embed = new EmbedBuilder()
        .setTitle("⚠️ User Warned")
        .setColor(0xFEE75C)
        .addFields(
          { name: "👤 Utente", value: `${user.tag}`, inline: true },
          { name: "🛡️ Moderatore", value: `${interaction.user.tag}`, inline: true },
          { name: "📌 Motivo", value: reason, inline: false },
          { name: "📊 Totale Warn", value: `${data[user.id].length}`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore durante l'assegnazione del warn",
        ephemeral: true
      });
    }
  }
};
