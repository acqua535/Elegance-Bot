const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {

    const commandsPath = path.join(__dirname, "comandi");

    if (!fs.existsSync(commandsPath)) {
        console.log("❌ Cartella comandi non trovata");
        return;
    }


    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));


    for (const file of commandFiles) {

        const command = require(
            path.join(commandsPath, file)
        );


        if (!command.data || !command.execute) {

            console.log(
                `⚠️ Comando ignorato: ${file}`
            );

            continue;

        }


        client.commands.set(
            command.data.name,
            command
        );


        console.log(
            `✅ Comando caricato: ${command.data.name}`
        );

    }

};
