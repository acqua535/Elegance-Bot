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



// Caricamento comandi
require("./commandHandler")(client);



// Registrazione slash commands
require("./deployCommands");



// Sistema ticket
const ticket = require("./ticket");



// Gestione errori

process.on(
    "unhandledRejection",
    (error) => {

        console.error(
            "❌ Errore non gestito:",
            error
        );

    }
);



process.on(
    "uncaughtException",
    (error) => {

        console.error(
            "❌ Eccezione non gestita:",
            error
        );

    }
);



// Bot online

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
    async (interaction) => {


        try {



            if (interaction.isChatInputCommand()) {


                const command =
                    client.commands.get(
                        interaction.commandName
                    );


                if (!command)
                    return;



                await command.execute(
                    interaction
                );

            }



            if (interaction.isStringSelectMenu()) {


                await ticket.categoryHandler(
                    interaction
                );


            }



            if (interaction.isButton()) {


                await ticket.buttonHandler(
                    interaction
                );


            }



        } catch(error) {


            console.error(
                "❌ Errore interaction:",
                error
            );



            if (
                !interaction.replied &&
                !interaction.deferred
            ) {


                await interaction.reply({

                    content:
                    "❌ Errore durante l'esecuzione.",

                    ephemeral:true

                });


            }


        }


    }
);



// Token

console.log(
    "TOKEN PRESENTE:",
    process.env.TOKEN ? "SI" : "NO"
);



client.login(
    process.env.TOKEN
);
