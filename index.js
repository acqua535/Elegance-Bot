const fs = require("fs");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 📦 LEGGE TUTTI I FILE DIRETTAMENTE DA /commands
const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of files) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// ⚡ INTERACTION HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    interaction.reply({
      content: "❌ Errore Elegance System",
      ephemeral: true
    });
  }
});

// 🚀 READY
client.once("ready", () => {
  console.log(`✨ Elegance ONLINE come ${client.user.tag}`);
});

client.login(process.env.TOKEN);
