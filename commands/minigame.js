const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

let lastGame = null;

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// 🎮 GIOCHI
const games = {
  coinflip: {
    name: "🪙 Coinflip",
    desc: "Testa o croce. Vinci se indovini il risultato.",
    result: () => (Math.random() < 0.5 ? "Testa" : "Croce")
  },

  rps: {
    name: "✊ Sasso Carta Forbici",
    desc: "Sasso batte forbici, forbici battono carta, carta batte sasso.",
    result: () => {
      const arr = ["Sasso", "Carta", "Forbici"];
      return arr[Math.floor(Math.random() * arr.length)];
    }
  },

  number: {
    name: "🎲 Numero Random",
    desc: "Numero da 0 a 10.",
    result: () => Math.floor(Math.random() * 11)
  },

  dice: {
    name: "🎯 Dado",
    desc: "Dado da 6 facce.",
    result: () => Math.floor(Math.random() * 6) + 1
  },

  luck: {
    name: "🍀 Fortuna",
    desc: "Gioco completamente casuale.",
    result: () => (Math.random() < 0.5 ? "Fortunato" : "Sfortunato")
  }
};

// 🔀 PICK GAME (no ripetizioni immediate)
function pickGame() {
  const keys = Object.keys(games);
  let filtered = keys.filter(g => g !== lastGame);

  if (filtered.length === 0) filtered = keys;

  const game = filtered[Math.floor(Math.random() * filtered.length)];
  lastGame = game;

  return game;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minigame")
    .setDescription("🎮 Avvia un minigioco casuale"),

  async execute(interaction) {
    try {
      const key = pickGame();
      const game = games[key];

      // 📢 ANNUNCIO
      await interaction.reply({
        content: `🎮 ${game.name}\n📌 ${game.desc}`
      });

      const msg = await interaction.fetchReply();

      // ⏳ COUNTDOWN
      for (let i = 10; i >= 1; i--) {
        const text =
          i > 7 ? "Preparazione..." :
          i > 4 ? "Quasi pronto..." :
          i > 2 ? "Ultimi secondi..." :
          "Inizio!";

        const embed = new EmbedBuilder()
          .setTitle("🎮 Minigame")
          .setDescription(`${text}\n⏱️ ${i}s`)
          .setColor(0xF1C40F);

        await msg.edit({ embeds: [embed] });
        await sleep(1000);
      }

      // 🎯 RISULTATO
      const result = game.result();

      const finalEmbed = new EmbedBuilder()
        .setTitle("🏁 Risultato Minigame")
        .setDescription(
          `🎮 Gioco: ${game.name}\n\n🏆 Risultato: **${result}**`
        )
        .setColor(0x2ECC71);

      await msg.edit({ embeds: [finalEmbed] });

      // 📊 STATS
      const data = load();
      const id = interaction.user.id;

      if (!data[id]) {
        data[id] = { wins: 0, games: 0 };
      }

      data[id].games += 1;

      // semplice win random (poi migliorabile)
      if (Math.random() < 0.5) {
        data[id].wins += 1;
      }

      save(data);

    } catch (err) {
      console.error(err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Errore minigame",
          ephemeral: true
        });
      }
    }
  }
};
