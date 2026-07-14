const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();


module.exports = async function deployCommands() {


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


                const command = require(
                    path.join(location, file)
                );


                if (!command.data) continue;


                if (loaded.has(command.data.name)) continue;


                loaded.add(command.data.name);


                commands.push(
                    command.data.toJSON()
                );


                console.log(
                    `📌 Deploy comando: ${command.data.name}`
                );



            } catch(error) {


                console.error(
                    `❌ Errore deploy ${file}:`,
                    error
                );


            }


        }


    }



    const rest = new REST({ version: "10" })

        .setToken(process.env.TOKEN);



    try {


    console.log(
        "🧹 Pulizia vecchi comandi globali..."
    );


    await rest.put(

        Routes.applicationCommands(
            "1526656748667146331"
        ),

        {
            body: []
        }

    );


    console.log(
        "✅ Global command eliminati"
    );



    console.log(
        "🔄 Aggiornamento slash command..."
    );


        await rest.put(

            Routes.applicationGuildCommands(

                "1526656748667146331",

                "1505173045269233736"

            ),

            {

                body: commands

            }

        );



        console.log(
            `✅ ${commands.length} slash command aggiornati!`
        );



    } catch(error) {


        console.error(
            "❌ Errore registrazione slash:",
            error
        );


    }


};
