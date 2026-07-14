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



// =====================
// COMMAND HANDLER
// =====================

require("./commandHandler")(client);



// =====================
// AUTO SLASH DEPLOY
// =====================

require("./deployCommand")();



// =====================
// SYSTEMS
// =====================

const ticket = require("./ticket");

const verify = require("./verify");

const buttonHandler = require("./buttonHandler");



// =====================
// ERROR HANDLING
// =====================

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




// =====================
// READY
// =====================

client.once(
    "clientReady",
    () => {


        console.log(
            `⚜️ Elegance-Bot online come ${client.user.tag}`
        );



        client.user.setActivity(
            "Elegance Community",
            {
                type: 3
            }
        );


    }
);




// =====================
// INTERACTIONS
// =====================

client.on(
    "interactionCreate",
    async interaction => {


        try {



            console.log(
                "📩 Interazione ricevuta:",
                interaction.commandName ||
                interaction.customId
            );





            // SLASH COMMANDS

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



                await command.execute(
                    interaction
                );


                return;

            }






            // SELECT MENU

            if(
                interaction.isStringSelectMenu()
            ){


                if(ticket?.categoryHandler){

                    await ticket.categoryHandler(
                        interaction
                    );

                }


                return;

            }







            // BUTTONS

            if(
                interaction.isButton()
            ){



                // VERIFY

                if(
                    interaction.customId ===
                    "verify_button"
                ){

                    await verify.buttonHandler(
                        interaction
                    );

                    return;

                }




                // GENERAL BUTTON HANDLER

                if(buttonHandler){

                    await buttonHandler(
                        interaction
                    );

                    return;

                }



                // TICKET FALLBACK

                if(ticket?.buttonHandler){

                    await ticket.buttonHandler(
                        interaction
                    );

                    return;

                }



                return;


            }







            // MODALS

            if(
                interaction.isModalSubmit()
            ){


                if(
                    interaction.customId ===
                    "verify_modal"
                ){

                    await verify.modalHandler(
                        interaction
                    );

                    return;

                }


            }





        } catch(error){


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


    }

);





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
