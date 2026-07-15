const fs = require("fs");
const path = require("path");



module.exports = function loadCommands(client) {



    const commandsPath = path.join(
        __dirname,
        "commands"
    );



    console.log(
        "📂 Cartella comandi:",
        commandsPath
    );



    if(!fs.existsSync(commandsPath)){


        console.error(
            "❌ Cartella commands non trovata!"
        );


        return;


    }






    const files = fs.readdirSync(commandsPath)

    .filter(file => file.endsWith(".js"))

    .filter(file => file !== "commandHandler.js")

    .filter(file => file !== "deployCommand.js");








    for(const file of files){



        try {



            const filePath = path.join(
                commandsPath,
                file
            );



            const command = require(filePath);





            if(
                !command.data ||
                !command.execute
            ){


                console.log(
                    `⚠️ File ignorato: ${file}`
                );


                continue;


            }







            const name = command.data.name;






            if(
                client.commands.has(name)
            ){



                console.log(
                    `⚠️ Comando duplicato ignorato: ${name}`
                );


                continue;


            }








            client.commands.set(

                name,

                command

            );








            console.log(

                `✅ Comando caricato: ${name}`

            );







        } catch(error){



            console.error(

                `❌ Errore caricando ${file}:`,

                error

            );


        }



    }







    console.log(

        `📦 Totale comandi caricati: ${client.commands.size}`

    );



};
