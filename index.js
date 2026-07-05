const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📦 COLLEZIONE COMANDI
client.commands = new Collection();

// 📂 CARICAMENTO COMANDI (SAFE)
const commandsPath = path.join(__dirname, "commands");

let commandFiles = [];

try {
  if (fs.existsSync(commandsPath)) {
    commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
  } else {
    console.log("⚠️ Cartella commands non trovata");
  }
} catch (err) {
  console.log("⚠️ Errore lettura commands:", err.message);
}

for (const file of commandFiles) {
  try {
    const command = require(`./commands/${file}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  } catch (err) {
    console.log(`❌ Errore comando ${file}:`, err.message);
  }
}

// ✅ BOT READY
client.once(Events.ClientReady, () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// ⚡ INTERACTIONS SAFE
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

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
  console.log("❌ TOKEN mancante nelle variabili ambiente");
} else {
  client.login(process.env.TOKEN);
}
