const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  Collection
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 📦 CARICAMENTO COMANDI
const folders = fs.readdirSync("./commands");

for (const folder of folders) {
  const path = `./commands/${folder}`;

  // se è un file singolo (minigame.js, meme.js)
  if (fs.lstatSync(path).isFile?.() || !fs.lstatSync(path).isDirectory()) continue;

  const files = fs.readdirSync(path);

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    const command = require(`${path}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// 📌 INTERACTION HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    interaction.reply({
      content: "❌ Errore interno Elegance System",
      ephemeral: true
    });
  }
});

// 🚀 READY
client.once("ready", () => {
  console.log(`✨ Elegance ONLINE come ${client.user.tag}`);
});

client.login(process.env.TOKEN);
