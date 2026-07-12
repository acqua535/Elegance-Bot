const { REST, Routes } = require("discord.js");
const fs = require("fs");

const commands = [];

const commandsPath = __dirname;

const commandFiles = fs.readdirSync(commandsPath)
    .filter(file => file === "say.js");

for (const file of commandFiles) {
    const command = require(`./${file}`);

    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: "10" })
    .setToken(process.env.TOKEN);

async function deploy() {
    try {
        console.log("🔄 Registrazione comandi in corso...");

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            {
                body: commands
            }
        );

        console.log(`✅ ${commands.length} comando/i registrato/i.`);
    } catch (error) {
        console.error("❌ Errore registrazione comandi:", error);
    }
}

deploy();
