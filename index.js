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



// Comandi
require("./commandHandler")(client);


// Anti Abuse
require("./anti-abuso")(client);


// Deploy Slash Commands
require("./deployCommand");



// Sistemi
const ticket = require("./ticket");
const verify = require("./verify");



// Errori

process.on(
    "unhandledRejection",
    error => {

        console.error(
            "❌ Errore non gestito:",
            error
        );

    }
);


process.on(
    "uncaughtException",
    error => {

        console.error(
            "❌ Eccezione non gestita:",
            error
        );

    }
);



// Online

client.once(
    "ready",
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



// Interazioni

client.on(
    "interactionCreate",
    async interaction => {


        try {


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




            if(
                interaction.isStringSelectMenu()
            ){

                await ticket.categoryHandler(
                    interaction
                );

                return;

            }




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
