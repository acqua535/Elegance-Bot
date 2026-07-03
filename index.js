const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

// 🧠 CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📦 COMMAND COLLECTION
client.commands = new Collection();

// ==========================
// 📁 LOAD COMMANDS
// ==========================
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (command.name) {
    client.commands.set(command.name, command);
  }
}

// ==========================
// 📁 LOAD EVENTS
// ==========================
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.name) {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ==========================
// 🚀 READY EVENT
// ==========================
client.once("ready", () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// ==========================
// 🔑 LOGIN
// ==========================
client.login(process.env.TOKEN);
