const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📦 COLLEZIONE COMANDI
client.commands = new Collection();

// 📂 CARICA COMANDI
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`⚠️ Comando ignorato: ${file}`);
  }
}

// ⚡ INTERACTION HANDLER
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
    await command.execute(interaction, client);
  } catch (err) {
    console.error("❌ Errore comando:", err);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Errore interno",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ Errore interno",
        ephemeral: true
      });
    }
  }
});

// 🚀 READY EVENT
client.once("ready", () => {
  console.log(`✅ Online come ${client.user.tag}`);
  console.log(`📌 Comandi caricati: ${client.commands.size}`);
});

// 🔑 LOGIN
client.login(process.env.TOKEN);
