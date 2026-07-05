const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { isStaff } = require("../utils/staff");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("🔨 Bannare un utente dal server")
    .addUserOption(o =>
      o.setName("user").setDescription("Utente").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason").setDescription("Motivo")
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

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "❌ Utente non trovato nel server.",
        ephemeral: true
      });
    }

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle("🔨 BAN ESEGUITO")
      .setColor(0xED4245)
      .setDescription(`🚫 **${user.tag}** è stato bannato`)
      .addFields(
        { name: "📌 Motivo", value: reason },
        { name: "👮 Staff", value: interaction.user.tag }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
