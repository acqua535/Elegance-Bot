const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { isStaff } = require("../utils/staff");

const FILE = "./utils/warns.json";

function load() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("⚠️ Aggiungi un warn a un utente")
    .addUserOption(o =>
      o.setName("user").setDescription("Utente").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason").setDescription("Motivo").setRequired(true)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: "❌ Non hai permessi.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const data = load();

    if (!data[user.id]) data[user.id] = [];

    data[user.id].push({
      reason,
      moderator: interaction.user.tag,
      date: Date.now()
    });

    save(data);

    const total = data[user.id].length;

    const embed = new EmbedBuilder()
      .setTitle("⚠️ WARN ASSEGNATO")
      .setColor(0xFEE75C)
      .setDescription(`⚠️ **${user.tag}** ha ricevuto un warn`)
      .addFields(
        { name: "📌 Motivo", value: reason },
        { name: "👮 Staff", value: interaction.user.tag },
        { name: "📊 Totale Warn", value: `${total}/3` }
      );

    await interaction.reply({ embeds: [embed] });

    // 🚨 AUTO PUNISHMENT
    if (total >= 3) {
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick("3 warn raggiunti");
    }
  }
};
