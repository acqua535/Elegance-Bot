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
// SYSTEMS
// ======================


require("./commandHandler")(client);


// Birthday System
require("./birthday-system")(client);


// Anti Abuse
require("./anti-abuse")(client);



// Slash Deploy
require("./deployCommands");



// ======================
// HANDLERS
// ======================


const ticket =
require("./ticket");


const verify =
require("./verify");


const poll =
require("./commands/poll");




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
// READY
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





            // Ticket Select Menu

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



                // Verify Button

                if(
                    interaction.customId === "verify_button"
                ){


                    await verify.buttonHandler(
                        interaction
                    );


                    return;

                }




                // Poll Buttons

                if(
                    interaction.customId.startsWith("poll_")
                ){


                    await poll.buttonHandler(
                        interaction
                    );


                    return;

                }




                // Ticket Buttons

                await ticket.buttonHandler(
                    interaction
                );


                return;


            }





            // Verify Modal

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

                });


            }


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
