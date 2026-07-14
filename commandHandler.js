const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {

    client.commands = new Map();

    const locations = [
        path.join(__dirname, "commands"),
        __dirname
    ];


    for (const location of locations) {

        if (!fs.existsSync(location)) {
            continue;
        }


        const files = fs.readdirSync(location)
            .filter(file => file.endsWith(".js"))
            .filter(file => file !== "commandHandler.js")
            .filter(file => file !== "deployCommand.js");


        for (const file of files) {

            try {

                const command = require(
                    path.join(location, file)
                );


                if (!command.data || !command.execute) {
                    continue;
                }


                // evita duplicati
                if (client.commands.has(command.data.name)) {
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

    }

};
