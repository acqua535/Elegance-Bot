const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const PARTNER_CHANNEL = "1508774443286003815";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("partner")
    .setDescription("Invia una richiesta partner"),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🤝 Partner Request")
        .setDescription(`Utente: **${interaction.user.tag}**`)
        .setColor(0x3498db)
        .setTimestamp();

      const channel = await interaction.guild.channels.fetch(PARTNER_CHANNEL);

      if (!channel) {
        return interaction.reply({
          content: "❌ Canale partner non trovato",
          ephemeral: true
        });
      }

      await channel.send({ embeds: [embed] });

      return interaction.reply({
        content: "📨 richiesta partner inviata",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore durante invio partner",
        ephemeral: true
      });
    }
  }
};
