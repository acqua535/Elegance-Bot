  const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { Client, Collection, GatewayIntentBits } = require("discord.js");

// ==========================
// CLIENT
// ==========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.commands = new Collection();

// ==========================
// LOAD COMMANDS
// ==========================
const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = require(filePath);

      if (command?.data?.name && command?.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Caricato: ${command.data.name}`);
      } else {
        console.log(`⚠️ Ignorato: ${file}`);
      }

    } catch (err) {
      console.error(`❌ Errore ${file}:`, err);
    }
  }
} else {
  console.warn("⚠️ Cartella commands non trovata");
}

// ==========================
// READY EVENT
// ==========================
client.once("ready", () => {
  console.log(`🤖 Online come ${client.user.tag}`);
});

// ==========================
// INTERACTION HANDLER
// ==========================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return interaction.reply({
      content: "❌ Comando non trovato.",
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ Errore ${interaction.commandName}:`, err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Errore durante il comando.",
        ephemeral: true
      });
    }
  }
});

// ==========================
// RESET SYSTEM (7 GIORNI)
// ==========================
const FILE = "./utils/stats.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function resetWeekly() {
  const data = load();

  for (const id in data) {
    data[id] = {
      partner: 0,
      collab: 0,
      wins: 0,
      games: 0
    };
  }

  save(data);
  console.log("🔄 RESET SETTIMANALE COMPLETATO");
}

// 7 giorni
const WEEK = 7 * 24 * 60 * 60 * 1000;
setInterval(resetWeekly, WEEK);

// ==========================
// LOGIN
// ==========================
client.login(process.env.TOKEN);
