const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Mostra informazioni dettagliate su un utente o bot")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Utente o bot da analizzare (puoi menzionare)")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user") || interaction.user;

      // ⚠️ member può non esistere se bot/utente non è nel server
      let member = null;

      try {
        member = await interaction.guild.members.fetch(user.id);
      } catch {
        member = null;
      }

      const roles =
        member
          ? member.roles.cache
              .filter(r => r.name !== "@everyone")
              .map(r => r.toString())
              .join(", ") || "Nessun ruolo"
          : "Non disponibile (utente non nel server)";

      const embed = new EmbedBuilder()
        .setTitle(`👤 User Info - ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor(user.bot ? 0xED4245 : 0x5865F2)
        .addFields(
          { name: "🆔 ID", value: user.id, inline: true },
          { name: "🤖 Bot", value: user.bot ? "Sì" : "No", inline: true },
          {
            name: "📅 Account creato",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
            inline: false
          },
          {
            name: "📥 Entrato nel server",
            value: member
              ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
              : "❌ Non nel server",
            inline: false
          },
          {
            name: "🎭 Ruoli",
            value: roles.length > 1024 ? "Troppi ruoli da mostrare" : roles,
            inline: false
          }
        )
        .setFooter({ text: "Elegance System • User Info" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Errore durante il caricamento userinfo",
        ephemeral: true
      });
    }
  }
};
