const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {

    client.commands = new Map();

    const commandsPath = path.join(__dirname, "commands");

    if (!fs.existsSync(commandsPath)) {
        console.log("❌ Cartella commands non trovata");
        return;
    }


    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));


    for (const file of commandFiles) {

        try {

            const command = require(
                path.join(commandsPath, file)
            );


            if (!command.data || !command.execute) {

                console.log(
                    `⚠️ Comando non valido: ${file}`
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


        } catch(error) {

            console.error(
                `❌ Errore caricando ${file}:`,
                error
            );

        }

    }

};
