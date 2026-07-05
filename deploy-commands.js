const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ==========================
// LOAD COMMANDS
// ==========================
const commands = [];

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  console.error("❌ Cartella commands non trovata");
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  try {
    const command = require(filePath);

    if (command?.data) {
      commands.push(command.data.toJSON());
      console.log(`✅ Aggiunto comando: ${command.data.name}`);
    } else {
      console.log(`⚠️ File ignorato: ${file}`);
    }
  } catch (err) {
    console.error(`❌ Errore su ${file}:`, err);
  }
}

// ==========================
// REST CLIENT
// ==========================
const rest = new REST({ version: "10" }).setToken(TOKEN);

// ==========================
// DEPLOY
// ==========================
(async () => {
  try {
    console.log("🚀 Inizio deploy comandi...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Comandi registrati con successo!");
  } catch (err) {
    console.error("❌ Errore deploy comandi:", err);
  }
})();
