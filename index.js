const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

// ==========================
// CLIENT SETUP
// ==========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

// ==========================
// LOAD COMMANDS
// ==========================
const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = require(filePath);

      if (command?.data?.name && command?.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Comando caricato: ${command.data.name}`);
      } else {
        console.log(`⚠️ File ignorato (non valido): ${file}`);
      }
    } catch (err) {
      console.error(`❌ Errore caricando ${file}:`, err);
    }
  }
} else {
  console.warn("⚠️ Cartella commands non trovata");
}

// ==========================
// READY EVENT
// ==========================
client.once("ready", () => {
  console.log(`✅ Online come ${client.user.tag}`);
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
    console.error(`❌ Errore comando ${interaction.commandName}:`, err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Errore durante l'esecuzione del comando.",
        ephemeral: true
      });
    }
  }
});

// ==========================
// LOGIN
// ==========================
client.login(process.env.TOKEN);
