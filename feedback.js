const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("feedback")
    .setDescription("💬 Invia una valutazione")
    .addStringOption(opt =>
      opt.setName("target")
        .setDescription("👤 Utente o bot da valutare (tag o ID)")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("descrizione")
        .setDescription("📝 Descrizione della valutazione")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("voto")
        .setDescription("⭐ Voto da 1 a 5")
        .setMinValue(1)
        .setMaxValue(5)
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getString("target");
    const desc = interaction.options.getString("descrizione");
    const voto = interaction.options.getInteger("voto");

    // ⭐ stelle visuali
    const stars = "⭐".repeat(voto);

    const embed = new EmbedBuilder()
      .setTitle("💬 Nuova Valutazione")
      .addFields(
        { name: "👤 Valutato", value: target, inline: false },
        { name: "📝 Descrizione", value: desc, inline: false },
        { name: "⭐ Voto", value: `${stars} (${voto}/5)`, inline: false },
        { name: "👤 Da", value: `${interaction.user.tag}`, inline: true }
      )
      .setColor(0xFFD700)
      .setFooter({ text: "Sistema Feedback" });

    await interaction.reply({
      content: "✅ Feedback inviato!",
      ephemeral: true
    });

    await interaction.channel.send({ embeds: [embed] });
  }
};
