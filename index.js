const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");


const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent

    ]

});


client.commands = new Collection();



// ======================
// COMMAND HANDLER
// ======================

require("./commandHandler")(client);



// ======================
// SLASH COMMAND DEPLOY
// ======================

require("./deployCommand");



// ======================
// SYSTEM HANDLERS
// ======================

const ticket =
require("./ticket");


const verify =
require("./verify");



// ======================
// ERROR HANDLING
// ======================

process.on(
    "unhandledRejection",
    (error)=>{

        console.error(
            "❌ Errore non gestito:",
            error
        );

    }
);


process.on(
    "uncaughtException",
    (error)=>{

        console.error(
            "❌ Eccezione non gestita:",
            error
        );

    }
);



// ======================
// BOT ONLINE
// ======================

client.once(
    "ready",
    ()=>{

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



// ======================
// INTERACTIONS
// ======================

client.on(
    "interactionCreate",
    async (interaction)=>{


        try{


            // Slash Commands

            if(
                interaction.isChatInputCommand()
            ){


                const command =
                client.commands.get(
                    interaction.commandName
                );


                if(!command)
                    return;


                await command.execute(
                    interaction
                );


                return;

            }




            // Ticket Menu

            if(
                interaction.isStringSelectMenu()
            ){


                await ticket.categoryHandler(
                    interaction
                );


                return;

            }





            // Buttons

            if(
                interaction.isButton()
            ){


                if(
                    interaction.customId === "verify_button"
                ){


                    await verify.buttonHandler(
                        interaction
                    );


                    return;

                }



                await ticket.buttonHandler(
                    interaction
                );


                return;

            }





            // Modal Verify

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


        }


    }
);



// ======================
// LOGIN
// ======================

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
