console.log("HANDLER NUOVO CARICATO");

const fs = require("fs");
const path = require("path");


module.exports = (client) => {


    const commandFiles = fs.readdirSync(__dirname)

        .filter(file =>

            file.endsWith(".js") &&

            file !== "index.js" &&

            file !== "commandHandler.js" &&

            file !== "deployCommands.js"

        );



    for (const file of commandFiles) {


        const command = require(
            path.join(__dirname, file)
        );



        if (command.data && command.execute) {


            client.commands.set(

                command.data.name,

                command

            );


            console.log(
                `✅ Comando caricato: ${command.data.name}`
            );


        }


    }


};
