const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { isStaff } = require("../utils/staff");

const file = "./utils/warns.json";

function load() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Dai un warn a un utente")
    .addUserOption(o => o.setName("user").setRequired(true))
    .addStringOption(o => o.setName("reason").setRequired(true)),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ content: "❌ No perms", ephemeral: true });
    }

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const data = load();

    if (!data[user.id]) data[user.id] = [];

    data[user.id].push({
      reason,
      moderator: interaction.user.tag
    });

    save(data);

    const total = data[user.id].length;

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Warn assegnato")
      .setDescription(`${user.tag} ha ricevuto un warn`)
      .addFields(
        { name: "Motivo", value: reason },
        { name: "Totale Warn", value: `${total}/3` },
        { name: "Staff", value: interaction.user.tag }
      )
      .setColor(0xFEE75C);

    await interaction.reply({ embeds: [embed] });

    // 💣 AUTO KICK A 3 WARN
    if (total >= 3) {
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick("3 warn raggiunti");
    }
  }
};
