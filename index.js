const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");


require("dotenv").config();



// ==========================
// CLIENT
// ==========================


const client = new Client({

    intents:[

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent

    ]

});



client.commands = new Collection();



// ==========================
// HANDLERS
// ==========================


const loadCommands =
require("./commandHandler");


const ticket =
require("./ticket");


const buttonHandler =
require("./buttonHandler");


const verify =
require("./verify");





// ==========================
// COMMAND LOADER
// ==========================


loadCommands(client);



console.log(

"📦 Comandi caricati:",

client.commands.size

);





// ==========================
// ERROR SYSTEM
// ==========================


process.on(

"unhandledRejection",

error=>{


console.error(

"❌ Unhandled Promise:",

error

);


});




process.on(

"uncaughtException",

error=>{


console.error(

"❌ Uncaught Exception:",

error

);


});







// ==========================
// READY
// ==========================


client.once(

"ready",

()=>{


console.log(

`⚜️ Elegance-Bot online come ${client.user.tag}`

);



client.user.setActivity(

"Elegance Community",

{

type:3

}

);



}

);







// ==========================
// INTERACTION ROUTER
// ==========================


client.on(

"interactionCreate",

async interaction => {



try {





// ==========================
// SLASH COMMANDS
// ==========================


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









// ==========================
// BUTTONS
// ==========================


if(

interaction.isButton()

){



await buttonHandler(

interaction

);



return;


}









// ==========================
// SELECT MENUS
// ==========================


if(

interaction.isStringSelectMenu()

){



// ==========================
// APERTURA TICKET
// ==========================


if(

interaction.customId === "ticket_category"

){



await ticket.categoryHandler(

interaction

);



return;


}






// ==========================
// ALTRI SELECT
// ==========================


if(

interaction.customId === "ticket_priority"

){



await ticket.router(

interaction

);



return;


}



}









// ==========================
// MODALS
// ==========================


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

"❌ Si è verificato un errore.",

ephemeral:true

}).catch(()=>{});



}



}



});









// ==========================
// TOKEN CHECK
// ==========================


console.log(

"TOKEN PRESENTE:",

process.env.TOKEN

?

"SI"

:

"NO"

);







// ==========================
// LOGIN
// ==========================


client.login(

process.env.TOKEN

);
