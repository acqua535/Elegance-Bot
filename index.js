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


// Anti Abuse
require("./anti-abuse")(client);


// Deploy Commands
require("./deployCommands");




// ======================
// HANDLERS
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
// READY
// ======================


client.once(
    "ready",
    ()=>{


        console.log(
            `⚜️ Elegance-Bot online come ${client.user.tag}`
        );


        client.user.setActivity(
            "
