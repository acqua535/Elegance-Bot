const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];

function loadCommands(folder) {
    if (!fs.existsSync(folder)) return;

    const files = fs.readdirSync(folder).filter(file => file.endsWith(".js"));

    for (const file of files) {
        try {
            const command = require(path.join(folder, file));

            if (command.data) {
                commands.push(command.data.toJSON());
                console.log(`✅ ${command.data.name}`);
            }
        } catch (err) {
            console.log(`❌ Errore in ${file}`);
            console.error(err);
        }
    }
}

// Root
loadCommands(__dirname);

// Cartella commands
loadCommands(path.join(__dirname, "commands"));

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🔄 Registrazione comandi...");

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Registrati ${commands.length} comandi.`);
    } catch (err) {
        console.error(err);
    }
})();
