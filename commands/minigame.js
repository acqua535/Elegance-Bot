const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

let lastGame = null;

const games = ["coinflip", "rps", "number"];

function pickGame() {
  let filtered = games.filter(g => g !== lastGame);
  let game = filtered[Math.floor(Math.random() * filtered.length)];
  lastGame = game;
  return game;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minigame")
    .setDescription("🎮 Minigioco casuale con countdown"),

  async execute(interaction) {
    try {
      const game = pickGame();

      // 🎮 ANNUNCIO GIOCO PRIMA DEL COUNTDOWN
      await interaction.reply({
        content: `🎮 Il gioco scelto è: **${game.toUpperCase()}**`,
        ephemeral: false
      });

      const msg = await interaction.fetchReply();

      const embed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle("🎮 Minigioco in arrivo!")
        .setDescription("⏳ Preparazione...")
        .setFooter({ text: "Elegance Minigame System" })
        .setTimestamp();

      await msg.edit({ embeds: [embed] });

      // 🔥 COUNTDOWN
      for (let i = 10; i >= 1; i--) {
        let statusText = "⏳ Inizio tra...";

        if (i <= 7) statusText = "🔍 Estrazione in corso...";
        if (i <= 4) statusText = "⚡ Quasi pronto...";
        if (i <= 2) statusText = "🎲 Ultimo secondo...";

        const update = new EmbedBuilder()
          .setColor(0xE67E22)
          .setTitle("🎮 Minigioco in arrivo!")
          .setDescription(`${statusText}\n\n⏱️ **${i}** secondi`)
          .setFooter({ text: "Elegance Countdown System" })
          .setTimestamp();

        await msg.edit({ embeds: [update] });
        await sleep(1000);
      }

      // 🎯 RISULTATO
      let resultText = "";

      if (game === "coinflip") {
        resultText = Math.random() < 0.5 ? "🪙 TESTA" : "🪙 CROCE";
      }

      if (game === "rps") {
        const arr = ["✊ Sasso", "✋ Carta", "✌️ Forbice"];
        resultText = arr[Math.floor(Math.random() * arr.length)];
      }

      if (game === "number") {
        resultText = `🎲 Numero: **${Math.floor(Math.random() * 10)}**`;
      }

      const finalEmbed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle("🎉 Minigioco estratto!")
        .setDescription(
          `🎮 **Gioco:** ${game.toUpperCase()}\n\n🏆 **Risultato:**\n${resultText}`
        )
        .setFooter({ text: "Elegance Minigame Completed" })
        .setTimestamp();

      await msg.edit({ embeds: [finalEmbed] });

    } catch (err) {
      console.error("Minigame error:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Errore nel minigioco",
          ephemeral: true
        });
      }
    }
  }
};
