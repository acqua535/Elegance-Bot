const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 📦 CARICAMENTO COMANDI
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

// ⚡ READY + REGISTRAZIONE COMANDI AUTOMATICA
client.once("ready", async () => {
  console.log(`✅ Online come ${client.user.tag}`);
  console.log(`📌 Comandi caricati: ${client.commands.size}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    const commands = client.commands.map(cmd => cmd.data.toJSON());

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("📌 Comandi GLOBAL registrati");
  } catch (err) {
    console.error("❌ Errore registrazione comandi:", err);
  }
});

// 💬 INTERACTION HANDLER
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

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot Elegance online ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server attivo sulla porta ${PORT}`);
});

// 🔑 LOGIN
client.login(process.env.TOKEN);
