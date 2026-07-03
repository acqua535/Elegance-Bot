const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const PARTNER_CHANNEL = "1508774443286003815";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("partner")
    .setDescription("Invia una richiesta partner professionale")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Messaggio della richiesta partner")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const text = interaction.options.getString("text");

      if (!text || text.trim().length === 0) {
        return interaction.reply({
          content: "❌ Devi inserire un testo valido.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🤝 Partner Request")
        .setDescription(
          `📩 **Messaggio:**\n${text}\n\n👤 **Utente:** ${interaction.user.tag}\n🆔 ${interaction.user.id}`
        )
        .setColor(0x5865F2)
        .setTimestamp()
        .setFooter({ text: "Elegance Partner System" });

      const channel = interaction.guild.channels.cache.get(PARTNER_CHANNEL);

      if (!channel) {
        return interaction.reply({
          content: "❌ Canale partner non trovato.",
          ephemeral: true
        });
      }

      await channel.send({ embeds: [embed] });

      await interaction.reply({
        content: "📨 Richiesta partner inviata con successo!",
        ephemeral: true
      });

    } catch (err) {
      console.error("Partner error:", err);

      return interaction.reply({
        content: "❌ Errore durante l'invio della richiesta.",
        ephemeral: true
      });
    }
  }
};
