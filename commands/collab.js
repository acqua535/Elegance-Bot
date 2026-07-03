const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const COLLAB_CHANNEL = "1522610038831845518";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collab")
    .setDescription("Invia una richiesta di collaborazione")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Descrivi la tua proposta di collaborazione")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const text = interaction.options.getString("text");

      const channel = interaction.guild.channels.cache.get(COLLAB_CHANNEL);

      if (!channel) {
        return interaction.reply({
          content: "❌ Il canale delle collaborazioni non è stato trovato.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle("🤝 Nuova richiesta di Collaborazione")
        .setDescription(text)
        .addFields(
          {
            name: "👤 Utente",
            value: `${interaction.user.tag}`,
            inline: true
          },
          {
            name: "🆔 ID",
            value: interaction.user.id,
            inline: true
          },
          {
            name: "📅 Data",
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`
          }
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: "Elegance Collaboration System"
        })
        .setTimestamp();

      await channel.send({
        embeds: [embed]
      });

      await interaction.reply({
        content: "✅ La tua richiesta di collaborazione è stata inviata!",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Si è verificato un errore durante l'invio della richiesta.",
          ephemeral: true
        });
      }
    }
  }
};
