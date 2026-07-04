const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { isStaff } = require("../utils/staff");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("👢 Espellere un utente dal server")
    .addUserOption(o => o.setName("user").setRequired(true))
    .addStringOption(o =>
      o.setName("reason").setDescription("Motivo del kick")
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: "❌ Non hai permessi.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "Nessun motivo";

    const member = await interaction.guild.members.fetch(user.id);
    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setTitle("👢 UTENTE KICKATO")
      .setColor(0xF39C12)
      .setDescription(`⚡ **${user.tag}** è stato espulso dal server`)
      .addFields(
        { name: "📌 Motivo", value: reason },
        { name: "👮 Staff", value: interaction.user.tag }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
