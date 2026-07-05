const { REST, Routes } = require("discord.js");
const fs = require("fs");

const commands = [];

const commandFiles = fs
  .readdirSync(__dirname)
  .filter(f => f.endsWith(".js") && f !== "index.js" && f !== "deployOnce.js");

for (const file of commandFiles) {
  const command = require(`./${file}`);
  if (command.data) commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🚀 Deploy slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Commands deployed!");
  } catch (err) {
    console.error(err);
  }
})();
