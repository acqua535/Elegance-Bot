const fs = require("fs");
const { REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [];

const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of files) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🔄 Aggiornamento comandi slash...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("📌 Comandi GLOBAL registrati");
  } catch (err) {
    console.error(err);
  }
})();
