const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";
const CHANNEL_ID = "1508774443286003815";

function load() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("partner")
    .setDescription("🤝 Invia richiesta partner")
    .addStringOption(o =>
      o.setName("text").setDescription("Messaggio").setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString("text");
    const data = load();
    const id = interaction.user.id;

    if (!data[id]) data[id] = { partner: 0, collab: 0, wins: 0, games: 0 };

    data[id].partner += 1;
    save(data);

    const embed = new EmbedBuilder()
      .setTitle("🤝 Partner Request")
      .setDescription(text)
      .addFields(
        { name: "👤 Utente", value: interaction.user.tag, inline: true },
        { name: "📊 Partner totali", value: `${data[id].partner}`, inline: true }
      )
      .setColor(0x5865F2)
      .setTimestamp();

    const channel = interaction.guild.channels.cache.get(CHANNEL_ID);

    if (!channel) {
      return interaction.reply({
        content: "❌ Canale partner non trovato",
        ephemeral: true
      });
    }

    await channel.send({ embeds: [embed] });

    return interaction.reply({
      content: "📨 Partner inviato!",
      ephemeral: true
    });
  }
};
