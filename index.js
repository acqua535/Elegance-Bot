const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📦 COLLEZIONE COMANDI
client.commands = new Collection();

/*
📂 LOAD COMANDI (ROOT MODE - DISCLOUD SAFE)
👉 legge tutti i .js nella cartella principale
👉 esclude index.js
*/
let commandFiles = [];

try {
  commandFiles = fs
    .readdirSync(__dirname)
    .filter(file => file.endsWith(".js") && file !== "index.js");
} catch (err) {
  console.log("❌ Errore lettura file comandi:", err.message);
}

// 🔁 REGISTRA COMANDI
for (const file of commandFiles) {
  try {
    const command = require(`./${file}`);

    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`⚠️ File ignorato (non comando valido): ${file}`);
    }

  } catch (err) {
    console.log(`❌ Errore caricando ${file}:`, err.message);
  }
}

// ✅ READY EVENT
client.once(Events.ClientReady, () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// ⚡ INTERACTIONS SAFE
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({
        content: "❌ Comando non trovato",
        ephemeral: true
      }).catch(() => {});
    }

    await command.execute(interaction);

  } catch (err) {
    console.error("❌ Interaction error:", err);

    if (interaction.replied || interaction.deferred) return;

    await interaction.reply({
      content: "❌ Errore interno comando",
      ephemeral: true
    }).catch(() => {});
  }
});

// 🔑 LOGIN SAFE
if (!process.env.TOKEN) {
  console.log("❌ TOKEN mancante nelle variabili ambiente Discloud");
} else {
  client.login(process.env.TOKEN);
}
