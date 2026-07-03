const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Mostra tutti i warn di un utente")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Utente da controllare")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      const data = load();

      const warns = data[user.id];

      if (!warns || warns.length === 0) {
        return interaction.reply({
          content: `✅ **${user.tag}** non ha nessun warn.`,
          ephemeral: true
        });
      }

      const list = warns.slice(0, 10).map((w, i) => {
        const date = w.date
          ? `<t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`
          : "data sconosciuta";

        return `**${i + 1}.** ${w.reason}\n🛡️ ${w.moderator}\n📅 ${date}`;
      }).join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle(`⚠️ Warns di ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor(0xFEE75C)
        .addFields(
          {
            name: "📊 Totale Warn",
            value: `${warns.length}`,
            inline: true
          },
          {
            name: "📌 Ultimi Warn (max 10)",
            value: list.length > 1024 ? "Troppi dati da mostrare" : list,
            inline: false
          }
        )
        .setFooter({ text: "Elegance Moderation System" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore nel caricamento warnings",
        ephemeral: true
      });
    }
  }
};
