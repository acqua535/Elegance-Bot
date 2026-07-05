const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";
const CHANNEL_ID = "1522610038831845518";

function load() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collab")
    .setDescription("⚡ Invia richiesta collab")
    .addStringOption(o =>
      o.setName("text").setDescription("Messaggio").setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString("text");
    const data = load();
    const id = interaction.user.id;

    if (!data[id]) data[id] = { partner: 0, collab: 0, wins: 0, games: 0 };

    data[id].collab += 1;
    save(data);

    const embed = new EmbedBuilder()
      .setTitle("⚡ Collab Request")
      .setDescription(text)
      .addFields(
        { name: "👤 Utente", value: interaction.user.tag, inline: true },
        { name: "📊 Collab totali", value: `${data[id].collab}`, inline: true }
      )
      .setColor(0x9B59B6)
      .setTimestamp();

    const channel = interaction.guild.channels.cache.get(CHANNEL_ID);

    if (!channel) {
      return interaction.reply({
        content: "❌ Canale collab non trovato",
        ephemeral: true
      });
    }

    await channel.send({ embeds: [embed] });

    return interaction.reply({
      content: "📨 Collab inviata!",
      ephemeral: true
    });
  }
};
