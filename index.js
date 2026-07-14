const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

require("dotenv").config();



const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent

    ]

});



client.commands = new Collection();



// ==========================
// COMMAND HANDLER
// ==========================

require("./commandHandler")(client);

console.log(
    "📦 Comandi caricati:",
    client.commands.size
);



// ==========================
// HANDLERS
// ==========================

const buttonHandler =
require("./buttonHandler");



const ticket =
require("./ticket");


const verify =
require("./verify");





// ==========================
// ERROR HANDLING
// ==========================


process.on(
    "unhandledRejection",
    error => {

        console.error(
            "❌ Unhandled Rejection:",
            error
        );

    }
);



process.on(
    "uncaughtException",
    error => {

        console.error(
            "❌ Uncaught Exception:",
            error
        );

    }
);





// ==========================
// READY
// ==========================


client.once(
"ready",
() => {


    console.log(

        `⚜️ Elegance-Bot online come ${client.user.tag}`

    );



    client.user.setActivity(

        "Elegance Community",

        {

            type:3

        }

    );


});







// ==========================
// INTERACTIONS
// ==========================


client.on(

"interactionCreate",

async interaction => {


try {



    /*
    =====================
    SLASH COMMANDS
    =====================
    */


    if(
        interaction.isChatInputCommand()
    ){



        const command =
        client.commands.get(
            interaction.commandName
        );



        if(!command){


            console.log(

                "❌ Comando non trovato:",
                interaction.commandName

            );


            return;

        }




        try {


            await command.execute(
                interaction
            );


        } catch(error){


            console.error(

                "❌ Errore comando:",
                interaction.commandName,
                error

            );



            if(
                !interaction.replied &&
                !interaction.deferred
            ){


                await interaction.reply({

                    content:
                    "❌ Errore durante il comando.",

                    ephemeral:true

                }).catch(()=>{});


            }


        }



        return;


    }






    /*
    =====================
    BUTTONS
    =====================
    */


    if(
        interaction.isButton()
    ){


        await buttonHandler(
            interaction
        );


        return;


    }








    /*
    =====================
    SELECT MENU
    =====================
    */


    if(
        interaction.isStringSelectMenu()
    ){



        await ticket.categoryHandler(
            interaction
        );


        return;


    }






    /*
    =====================
    MODALS
    =====================
    */


    if(
        interaction.isModalSubmit()
    ){



        if(
            interaction.customId === "verify_modal"
        ){


            await verify.modalHandler(
                interaction
            );


            return;

        }



    }




}

catch(error){



console.error(

"❌ Errore interaction:",
error

);



if(
!interaction.replied &&
!interaction.deferred
){


await interaction.reply({

content:
"❌ Errore durante l'esecuzione.",

ephemeral:true

}).catch(()=>{});


}



}



});







// ==========================
// TOKEN
// ==========================


console.log(

"TOKEN PRESENTE:",

process.env.TOKEN
?
"SI"
:
"NO"

);




client.login(
    process.env.TOKEN
);
