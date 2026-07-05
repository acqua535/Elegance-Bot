const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("📢 Il bot invia un messaggio")
    .addStringOption(o =>
      o.setName("text")
        .setDescription("Messaggio")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const text = interaction.options.getString("text");

    await interaction.channel.send({
      content: text,
      allowedMentions: { parse: [] }
    });

    await interaction.reply({
      content: "✅ Messaggio inviato",
      ephemeral: true
    });
  }
};
