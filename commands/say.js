const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Il bot dice un messaggio")
    .addStringOption(o =>
      o.setName("text").setDescription("testo").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const text = interaction.options.getString("text");

    await interaction.reply({ content: "✅ Inviato", ephemeral: true });
    await interaction.channel.send(text);
  }
};
