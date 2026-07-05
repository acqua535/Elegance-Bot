const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [];

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  console.log("❌ Cartella commands non trovata");
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  try {
    const cmd = require(path.join(commandsPath, file));

    if (cmd?.data) {
      commands.push(cmd.data.toJSON());
      console.log(`✅ ${cmd.data.name} caricato`);
    }
  } catch (err) {
    console.error(`❌ Errore su ${file}:`, err);
  }
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🚀 Deploy slash commands...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Deploy completato!");
  } catch (err) {
    console.error("❌ Errore deploy:", err);
  }
})();
