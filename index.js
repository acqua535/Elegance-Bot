const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { Client, Collection, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
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
        console.log(`✅ ${command.data.name} caricato`);
      } else {
        console.log(`⚠️ Ignorato: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Errore in ${file}:`, err);
    }
  }
} else {
  console.warn("⚠️ commands/ non trovata");
}

// ==========================
// READY
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
      content: "❌ Comando non trovato",
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Errore comando",
        ephemeral: true
      });
    }
  }
});

// ==========================
// LOGIN
// ==========================
client.login(process.env.TOKEN);
