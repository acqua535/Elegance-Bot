const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const FILE = "./utils/stats.json";

// ==========================
// LOAD / SAVE SAFE
// ==========================
function load() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ==========================
// 10 MINIGAMES
// ==========================
const games = [
  {
    name: "🪙 Coinflip",
    desc: "Testa o croce",
    result: () => (Math.random() < 0.5 ? "Testa" : "Croce")
  },
  {
    name: "🎲 Dado",
    desc: "Dado 1-6",
    result: () => Math.floor(Math.random() * 6) + 1
  },
  {
    name: "🍀 Fortuna",
    desc: "Fortunato o sfortunato",
    result: () => (Math.random() < 0.5 ? "Fortunato" : "Sfortunato")
  },
  {
    name: "🔢 Numero",
    desc: "0 - 10",
    result: () => Math.floor(Math.random() * 11)
  },
  {
    name: "⚔️ Duello RNG",
    desc: "Combattimento casuale",
    result: () => (Math.random() < 0.5 ? "Vittoria" : "Sconfitta")
  },
  {
    name: "🎯 Precisione",
    desc: "Percentuale di precisione",
    result: () => `${Math.floor(Math.random() * 101)}%`
  },
  {
    name: "🧠 IQ Test",
    desc: "IQ casuale",
    result: () => `${Math.floor(Math.random() * 200)} IQ`
  },
  {
    name: "🔥 Temperatura",
    desc: "Freddo o caldo estremo",
    result: () => (Math.random() < 0.5 ? "❄️ Freddo" : "🔥 Caldo")
  },
  {
    name: "💀 Death Roll",
    desc: "Vivi o muori",
    result: () => (Math.random() < 0.2 ? "💀 Morto" : "🟢 Vivo")
  },
  {
    name: "🌌 Universo",
    desc: "Evento cosmico",
    result: () => {
      const arr = ["Big Bang", "Supernova", "Buco Nero", "Nulla Cosmico"];
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }
];

// ==========================
// PICK GAME
// ==========================
function pickGame() {
  return games[Math.floor(Math.random() * games.length)];
}

// ==========================
// SLEEP
// ==========================
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ==========================
// COMMAND
// ==========================
module.exports = {
  data: new SlashCommandBuilder()
    .setName("minigame")
    .setDescription("🎮 Avvia un minigioco casuale"),

  async execute(interaction) {
    try {
      const game = pickGame();

      // 📢 INTRO + TUTORIAL
      await interaction.reply({
        content: `🎮 **${game.name}**\n📌 ${game.desc}\n\n📖 Tutorial: segui il risultato finale per vincere!`
      });

      const msg = await interaction.fetchReply();

      // ⏳ TUTORIAL TIME
      await sleep(3000);

      // ==========================
      // COUNTDOWN 10 SECONDI
      // ==========================
      for (let i = 10; i >= 1; i--) {
        const embed = new EmbedBuilder()
          .setTitle("🎮 Minigame in corso")
          .setDescription(`⏱️ Inizio tra **${i}s**`)
          .setColor(0xF1C40F);

        await msg.edit({ embeds: [embed] });
        await sleep(1000);
      }

      // ==========================
      // RESULT
      // ==========================
      const result = game.result();

      const finalEmbed = new EmbedBuilder()
        .setTitle("🏁 Risultato Minigame")
        .setDescription(
          `🎮 Gioco: **${game.name}**\n\n🏆 Risultato: **${result}**`
        )
        .setColor(0x2ECC71)
        .setTimestamp();

      await msg.edit({ embeds: [finalEmbed] });

      // ==========================
      // STATS SYSTEM
      // ==========================
      const data = load();
      const id = interaction.user.id;

      if (!data[id]) {
        data[id] = {
          partner: 0,
          collab: 0,
          wins: 0,
          games: 0
        };
      }

      data[id].games += 1;

      // win random (base system)
      if (Math.random() < 0.5) {
        data[id].wins += 1;
      }

      save(data);

    } catch (err) {
      console.error(err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Errore nel minigame",
          ephemeral: true
        });
      }
    }
  }
};
