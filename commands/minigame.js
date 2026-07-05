const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { checkWeeklyReset } = require("../utils/resetStats");

const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ start: Date.now(), users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// 🎮 MINI GIOCHI PIÙ GRANDI E VARI
const games = [
  {
    name: "🪙 Coinflip",
    tutorial: "Scegli testa o croce. 50% di possibilità di vincere.",
    run: () => (Math.random() < 0.5 ? "Testa" : "Croce"),
    winChance: 0.5
  },
  {
    name: "🎲 Dice Roll",
    tutorial: "Tira un dado da 6 facce. Numeri casuali da 1 a 6.",
    run: () => Math.floor(Math.random() * 6) + 1,
    winChance: 0.4
  },
  {
    name: "🔢 Number Guess",
    tutorial: "Estrai un numero casuale da 0 a 10.",
    run: () => Math.floor(Math.random() * 11),
    winChance: 0.45
  },
  {
    name: "✊ Sasso Carta Forbici",
    tutorial: "Sasso batte forbici, forbici batte carta, carta batte sasso.",
    run: () => ["Sasso", "Carta", "Forbici"][Math.floor(Math.random() * 3)],
    winChance: 0.5
  },
  {
    name: "🍀 Luck Test",
    tutorial: "Test pura fortuna: puoi essere fortunato o sfortunato.",
    run: () => (Math.random() < 0.5 ? "Fortunato" : "Sfortunato"),
    winChance: 0.5
  },
  {
    name: "⚡ Reflex Game",
    tutorial: "Testa i riflessi: risultato veloce o lento.",
    run: () => (Math.random() < 0.5 ? "Veloce" : "Lento"),
    winChance: 0.48
  },
  {
    name: "🎯 Lucky Shot",
    tutorial: "Tiro casuale: puoi colpire o mancare il bersaglio.",
    run: () => (Math.random() < 0.5 ? "Colpito" : "Mancato"),
    winChance: 0.5
  }
];

function pickGame() {
  return games[Math.floor(Math.random() * games.length)];
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minigame")
    .setDescription("🎮 Avvia un minigioco casuale"),

  async execute(interaction) {
    const data = checkWeeklyReset();
    const id = interaction.user.id;

    if (!data.users[id]) {
      data.users[id] = {
        partner: 0,
        collab: 0,
        wins: 0,
        games: 0
      };
    }

    const game = pickGame();

    // 📢 STEP 1: ANNUNCIO + TUTORIAL
    const introEmbed = new EmbedBuilder()
      .setTitle("🎮 Minigame in arrivo!")
      .setDescription(
        `🎯 Gioco selezionato: **${game.name}**\n\n📖 **Come si gioca:**\n${game.tutorial}\n\n⏳ Inizio tra pochi secondi...`
      )
      .setColor(0xF1C40F);

    await interaction.reply({ embeds: [introEmbed] });

    const msg = await interaction.fetchReply();

    // ⏳ 3 SECONDI DI LETTURA TUTORIAL
    await sleep(3000);

    // ⏱️ COUNTDOWN 10 SECONDI
    for (let i = 10; i >= 1; i--) {
      const embed = new EmbedBuilder()
        .setTitle("🎮 Minigame Countdown")
        .setDescription(
          `🎯 Gioco: **${game.name}**\n\n⏱️ Inizio tra: **${i}s**`
        )
        .setColor(i <= 3 ? 0xED4245 : 0xF1C40F);

      await msg.edit({ embeds: [embed] });
      await sleep(1000);
    }

    // 🎯 RISULTATO
    const result = game.run();
    const win = Math.random() < game.winChance;

    data.users[id].games += 1;
    if (win) data.users[id].wins += 1;

    save(data);

    const finalEmbed = new EmbedBuilder()
      .setTitle("🏁 Risultato Minigame")
      .setDescription(
        `🎮 Gioco: **${game.name}**\n\n🎯 Risultato: **${result}**`
      )
      .setColor(win ? 0x57F287 : 0xED4245)
      .setTimestamp();

    await msg.edit({ embeds: [finalEmbed] });
  }
};
