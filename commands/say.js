const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Il bot invia un messaggio nel canale")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Messaggio da inviare")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const text = interaction.options.getString("text");

    if (!text || text.trim().length === 0) {
      return interaction.reply({
        content: "❌ Messaggio non valido",
        ephemeral: true
      });
    }

    try {
      await interaction.channel.send(text);

      return interaction.reply({
        content: "✅ Messaggio inviato",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore nell'invio messaggio",
        ephemeral: true
      });
    }
  }
};
