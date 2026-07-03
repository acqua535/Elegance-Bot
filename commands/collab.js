const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const COLLAB_CHANNEL = "1522610038831845518";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collab")
    .setDescription("Invia una richiesta di collaborazione"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("⚡ Collab Request")
      .setDescription(`Utente: **${interaction.user.tag}**`)
      .setColor("Purple")
      .setTimestamp();

    try {
      const channel = await interaction.guild.channels.fetch(COLLAB_CHANNEL);

      if (!channel) {
        return interaction.reply({
          content: "❌ Canale collab non trovato",
          ephemeral: true
        });
      }

      await channel.send({ embeds: [embed] });

      return interaction.reply({
        content: "📨 Richiesta collab inviata",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore durante invio collab",
        ephemeral: true
      });
    }
  }
};
