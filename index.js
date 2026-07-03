const fs = require("fs");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 📦 CARICA COMANDI
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

// 🚀 READY + SLASH REGISTRATION
client.once("clientReady", async () => {
  console.log(`✅ Online come ${client.user.tag}`);
  console.log(`📌 Comandi caricati: ${client.commands.size}`);

  const TOKEN = process.env.TOKEN;
  const CLIENT_ID = process.env.CLIENT_ID;

  if (!TOKEN || !CLIENT_ID) {
    console.error("❌ TOKEN o CLIENT_ID mancanti nelle variabili ENV");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: client.commands.map(cmd => cmd.data.toJSON())
      }
    );

    console.log("📌 Comandi GLOBAL registrati");
  } catch (err) {
    console.error("❌ Errore registrazione comandi:", err);
  }
});

// 🔐 LOGIN
client.login(process.env.TOKEN);
