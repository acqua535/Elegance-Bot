const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

// LOAD COMMANDS
for (const file of fs.readdirSync("./commands")) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// LOAD EVENTS
for (const file of fs.readdirSync("./events")) {
  const event = require(`./events/${file}`);
  client.on(event.name, (...args) => event.execute(...args, client));
}

client.once("ready", () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

client.login(process.env.TOKEN);
