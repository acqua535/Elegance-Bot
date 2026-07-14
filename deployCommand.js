const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const commands = [];
const loaded = new Set();

const locations = [
    path.join(__dirname, "commands"),
    __dirname
];

for (const location of locations) {

    if (!fs.existsSync(location)) continue;

    const files = fs.readdirSync(location)
        .filter(file => file.endsWith(".js"))
        .filter(file => file !== "index.js")
        .filter(file => file !== "deployCommand.js")
        .filter(file => file !== "commandHandler.js");

    for (const file of files) {

        try {

            const command = require(path.join(location, file));

            if (!command.data) continue;

            if (loaded.has(command.data.name)) continue;

            loaded.add(command.data.name);

            commands.push(command.data.toJSON());

            console.log(`✅ Comando caricato: ${command.data.name}`);

        } catch (err) {

            console.error(`❌ Errore caricando ${file}:`, err);

        }

    }

}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log("🔄 Registrazione comandi...");

        await rest.put(
            Routes.applicationCommands("1526656748667146331"),
            {
                body: commands
            }
        );

        console.log(`✅ ${commands.length} comandi registrati correttamente!`);

    } catch (error) {

        console.error(error);

    }

})();
