const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Fa parlare il bot")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Messaggio da inviare")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    try {
      const text = interaction.options.getString("text");

      await interaction.channel.send({
        content: text,
        allowedMentions: {
          parse: []
        }
      });

      await interaction.reply({
        content: "✅ Messaggio inviato.",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Errore durante l'invio del messaggio.",
          ephemeral: true
        });
      }
    }
  }
};
