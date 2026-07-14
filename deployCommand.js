require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");


const commands = [];


const commandsPath = path.join(
    __dirname,
    "commands"
);



const commandFiles =
fs.readdirSync(commandsPath)
.filter(file => file.endsWith(".js"));



for (const file of commandFiles) {


    const command =
    require(
        path.join(commandsPath, file)
    );


    if(command.data){


        commands.push(
            command.data.toJSON()
        );


        console.log(
            `✅ Comando caricato: ${command.data.name}`
        );

    }

}



const rest = new REST({

    version:"10"

}).setToken(
    process.env.TOKEN
);



(async()=>{


    try {


        console.log(
            "🔄 Registrazione comandi..."
        );



        await rest.put(

            Routes.applicationCommands(

                "1526646173937565706"

            ),

            {
                body: commands
            }

        );



        console.log(

            `✅ ${commands.length} comandi registrati correttamente!`

        );



    } catch(error){


        console.error(error);


    }


})();
