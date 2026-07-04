const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { isStaff } = require("../utils/staff");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("🔨 Bannare un utente dal server")
    .addUserOption(o => o.setName("user").setRequired(true))
    .addStringOption(o =>
      o.setName("reason").setDescription("Motivo del ban")
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
    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle("🔨 UTENTE BANNATO")
      .setColor(0xED4245)
      .setDescription(`🚫 **${user.tag}** è stato bannato dal server`)
      .addFields(
        { name: "📌 Motivo", value: reason },
        { name: "👮 Staff", value: interaction.user.tag }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
