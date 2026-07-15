const fs = require("fs");
const path = require("path");


module.exports = function loadCommands(client) {



    const locations = [


        path.join(__dirname, "commands"),


        __dirname


    ];





    for (const location of locations) {



        if (!fs.existsSync(location)) {



            console.log(

                `⚠️ Percorso non trovato: ${location}`

            );


            continue;


        }







        const files = fs.readdirSync(location)


            .filter(file => file.endsWith(".js"))


            .filter(file => file !== "commandHandler.js")


            .filter(file => file !== "deployCommand.js")


            .filter(file => file !== "index.js");








        for (const file of files) {



            try {



                console.log(

                    "📂 Caricamento file:",

                    path.join(location, file)

                );





                const command = require(

                    path.join(location, file)

                );







                if(

                    !command.data ||

                    !command.execute

                ){


                    continue;


                }







                if(

                    client.commands.has(

                        command.data.name

                    )

                ){



                    console.log(

                        `⚠️ Comando duplicato ignorato: ${command.data.name}`

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



    }







    console.log(


        `📦 Totale comandi caricati: ${client.commands.size}`


    );



};
