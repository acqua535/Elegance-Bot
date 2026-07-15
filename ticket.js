const {

    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    AttachmentBuilder

} = require("discord.js");


const fs = require("fs");



// =====================================
// CONFIG
// =====================================


const LOG_CHANNEL_ID = "1505261606483923105";

const TICKET_CATEGORY_ID = "1525919850764177408";


const TICKET_STAFF_ROLES = [

    "1505192718068879430",
    "1505192964769714287"

];




// =====================================
// MEMORY SYSTEM
// =====================================


const activeTickets = new Map();

const claimedTickets = new Map();

const ticketPriority = new Map();

const ticketActivity = new Map();




// =====================================
// EMBED
// =====================================


function createEmbed(title, description){


    return new EmbedBuilder()

        .setTitle(title)

        .setDescription(description)

        .setColor("Gold")

        .setTimestamp();


}





// =====================================
// QUESTIONS SYSTEM
// =====================================


const ticketQuestions = {


    partner:[

        "Qual è il nome del tuo progetto/server?",

        "Che tipo di collaborazione proponi?",

        "Perché dovremmo collaborare?"

    ],



    staff:[

        "Qual è la tua esperienza nello staff?",

        "Perché vuoi entrare nel nostro team?",

        "Quanto tempo puoi dedicare?"

    ],



    bug:[

        "Descrivi il problema riscontrato.",

        "Quando si verifica il problema?",

        "Hai screenshot o prove?"

    ],



    idea:[

        "Qual è la tua idea?",

        "Come migliorerebbe il server?",

        "Hai altri dettagli?"

    ]

};





// =====================================
// QUESTIONS COLLECT
// =====================================


async function collectQuestions(interaction,type){



    const questions = ticketQuestions[type];

    let answers = [];




    await interaction.followUp({

        embeds:[

            createEmbed(

                "🤖 Assistenza iniziale",

                `
Non sono un AI.

Ho però alcune funzionalità automatiche per aiutarti prima dell'intervento dello Staff.

Rispondi alle domande che ti verranno fatte.

`

            )

        ],

        ephemeral:true

    });





    for(const question of questions){



        await interaction.followUp({

            content:

            `❓ ${question}`,

            ephemeral:true

        });





        const response = await interaction.channel.awaitMessages({

            filter:

            m =>

            m.author.id === interaction.user.id,

            max:1,

            time:60000

        }).catch(()=>null);





        if(response){


            answers.push(

                response.first().content

            );


        }


    }





    await interaction.followUp({

        embeds:[

            createEmbed(

                "⏳ Preparazione ticket",

                `
Le domande sono state completate.

Il ticket sta per essere assegnato allo Staff.

Attendi qualche secondo...

`

            )

        ],

        ephemeral:true

    });




    return answers;


}






// =====================================
// COMMAND
// =====================================


module.exports = {


data:

new SlashCommandBuilder()

.setName("ticket")

.setDescription(

"Apri un ticket di supporto"

),




async execute(interaction){



const menu = new StringSelectMenuBuilder()


.setCustomId(

"ticket_category"

)


.setPlaceholder(

"Scegli il tipo di richiesta"

)


.addOptions([



{

label:"Supporto Partner",

description:"Collaborazioni e partnership",

value:"partner",

emoji:"🤝"

},



{

label:"Bando Staff",

description:"Candidatura staff",

value:"staff",

emoji:"🛡️"

},



{

label:"Segnalazione Bug",

description:"Problemi tecnici",

value:"bug",

emoji:"🐞"

},



{

label:"Idea",

description:"Suggerimenti",

value:"idea",

emoji:"💡"

}



]);





const row = new ActionRowBuilder()

.addComponents(menu);





await interaction.reply({

embeds:[

createEmbed(

"🎫 Elegance Support",

`
Benvenuto nel supporto.

Seleziona la categoria del tuo ticket.

`

)

],

components:[row]

});



},







// =====================================
// CATEGORY HANDLER
// =====================================


async categoryHandler(interaction){



await interaction.deferReply({

ephemeral:true

});




const type = interaction.values[0];




const answers = await collectQuestions(

interaction,

type

);





const names = {


partner:"supporto-partner",

staff:"bando-staff",

bug:"segnalazione-bug",

idea:"idee"

};





const channel = await interaction.guild.channels.create({



name:

`🎫・${names[type]}-${interaction.user.username}`,


type:

ChannelType.GuildText,


parent:

TICKET_CATEGORY_ID,



permissionOverwrites:[


{

id:

interaction.guild.id,


deny:[

PermissionFlagsBits.ViewChannel

]

},



{

id:

interaction.user.id,


allow:[

PermissionFlagsBits.ViewChannel,

PermissionFlagsBits.SendMessages,

PermissionFlagsBits.ReadMessageHistory

]

},



...TICKET_STAFF_ROLES.map(role=>({


id:role,


allow:[

PermissionFlagsBits.ViewChannel,

PermissionFlagsBits.SendMessages,

PermissionFlagsBits.ReadMessageHistory

]


}))

]

});





activeTickets.set(

interaction.user.id,

channel.id

);





ticketPriority.set(

channel.id,

"🟢 Basso"

);

    // =====================================
// INITIAL TICKET MESSAGE
// =====================================


const managementMenu = new StringSelectMenuBuilder()

.setCustomId(

"ticket_management"

)

.setPlaceholder(

"🎫 Gestione Ticket"

)

.addOptions([


{

label:"Reclama",

description:"Prendi in gestione il ticket",

value:"claim",

emoji:"👤"

},



{

label:"Passa ad altro Staff",

description:"Rimuovi il reclamo attuale",

value:"transfer",

emoji:"🔄"

},



{

label:"Cambia priorità",

description:"Modifica il livello del ticket",

value:"priority",

emoji:"📌"

},



{

label:"Aggiungi membro",

description:"Aggiungi un utente al ticket",

value:"add_member",

emoji:"👥"

},



{

label:"Rimuovi membro",

description:"Rimuovi un utente dal ticket",

value:"remove_member",

emoji:"🚫"

},



{

label:"Cambia nome",

description:"Modifica il nome del ticket",

value:"rename",

emoji:"✏️"

},



{

label:"Transcript",

description:"Genera il transcript",

value:"transcript",

emoji:"📋"

},



{

label:"Informazioni",

description:"Mostra informazioni ticket",

value:"info",

emoji:"📊"

},



{

label:"Chiudi",

description:"Chiudi il ticket",

value:"close",

emoji:"🔒"

}



]);





const menuRow = new ActionRowBuilder()

.addComponents(

managementMenu

);





const ticketEmbed = new EmbedBuilder()

.setTitle(

"🎫 Ticket Aperto"

)

.setDescription(

`
Benvenuto nel tuo ticket.

Lo Staff risponderà appena possibile.

━━━━━━━━━━━━━━

📌 Priorità:
🟢 Basso

👤 Utente:
${interaction.user}

📂 Categoria:
${type}

━━━━━━━━━━━━━━

Puoi utilizzare il menu qui sotto per le funzioni del ticket.

`

)

.setColor("Green")

.setTimestamp();






await channel.send({


content:

`${interaction.user} ${TICKET_STAFF_ROLES.map(r=>`<@&${r}>`).join(" ")}`,



embeds:[

ticketEmbed

],



components:[

menuRow

]

});





// =====================================
// SAVE TICKET DATA
// =====================================


ticketActivity.set(

channel.id,

{

owner:

interaction.user.id,


type,


answers,


created:

Date.now()


}

);






// =====================================
// LOG CREATION
// =====================================


const logs = interaction.guild.channels.cache.get(

LOG_CHANNEL_ID

);





if(logs){



logs.send({


embeds:[

createEmbed(

"🎫 Ticket Creato",

`
👤 Utente:

${interaction.user}


📂 Categoria:

${type}


📌 Priorità:

🟢 Basso


📍 Canale:

${channel}

`

)

]

});



}






await interaction.editReply({

content:

`✅ Ticket creato: ${channel}`

});



},





// =====================================
// MENU HANDLER
// =====================================


async menuHandler(interaction){



const value = interaction.values[0];



if(

value === "claim"

){



const member = interaction.member;



const hasRole = TICKET_STAFF_ROLES.some(

r => member.roles.cache.has(r)

);



if(!hasRole){

return interaction.reply({

content:

"❌ Non puoi reclamare ticket.",

ephemeral:true

});

}





claimedTickets.set(

interaction.channel.id,

interaction.user.id

);





await interaction.reply({

embeds:[

createEmbed(

"👤 Ticket Reclamato",

`
Questo ticket è stato preso in gestione da:

${interaction.user}

`

)

]

});





return;

}




if(

value === "priority"

){



const priorityMenu = new StringSelectMenuBuilder()

.setCustomId(

"ticket_priority"

)

.setPlaceholder(

"Scegli priorità"

)

.addOptions([


{

label:"Basso",

description:"Priorità normale",

value:"low",

emoji:"🟢"

},



{

label:"Medio",

description:"Richiede attenzione",

value:"medium",

emoji:"🟠"

},



{

label:"Alto",

description:"Urgente",

value:"high",

emoji:"🔴"

}



]);





return interaction.reply({

components:[

new ActionRowBuilder()

.addComponents(priorityMenu)

],


ephemeral:true


});



}

    // =====================================
// PRIORITY HANDLER
// =====================================


async priorityHandler(interaction){



const value = interaction.values[0];



let priority;

let color;




switch(value){


case "low":

priority = "🟢 Basso";

color = "Green";

break;



case "medium":

priority = "🟠 Medio";

color = "Orange";

break;



case "high":

priority = "🔴 Alto";

color = "Red";

break;


}





ticketPriority.set(

interaction.channel.id,

priority

);





const messages = await interaction.channel.messages.fetch({

limit:20

});





const ticketMessage = messages.find(

m =>

m.author.id === interaction.client.user.id &&

m.embeds.length

);





if(ticketMessage){


const oldEmbed = ticketMessage.embeds[0];


const newEmbed = EmbedBuilder.from(oldEmbed)

.setColor(color)

.setDescription(

oldEmbed.description

.replace(

/📌 Priorità:.*/,

`📌 Priorità:\n${priority}`

)

);



await ticketMessage.edit({

embeds:[newEmbed]

});


}





await interaction.reply({

content:

`✅ Priorità cambiata: ${priority}`,

ephemeral:true

});



},







// =====================================
// ADD MEMBER
// =====================================


async addMemberHandler(interaction){



await interaction.reply({

content:

"👥 Menziona l'utente da aggiungere.",

ephemeral:true

});





const collector = interaction.channel.createMessageCollector({

filter:

m => m.author.id === interaction.user.id,

max:1,

time:30000

});





collector.on(

"collect",

async message => {



const member = message.mentions.members.first();



if(!member){


return message.reply(

"❌ Utente non trovato."

);


}





await interaction.channel.permissionOverwrites.edit(

member.id,

{

ViewChannel:true,

SendMessages:true,

ReadMessageHistory:true

}

);





message.reply(

`✅ ${member} aggiunto al ticket.`

);



}

);



},







// =====================================
// REMOVE MEMBER
// =====================================


async removeMemberHandler(interaction){



await interaction.reply({

content:

"🚫 Menziona l'utente da rimuovere.",

ephemeral:true

});





const collector = interaction.channel.createMessageCollector({

filter:

m => m.author.id === interaction.user.id,

max:1,

time:30000

});





collector.on(

"collect",

async message => {



const member = message.mentions.members.first();



if(!member){

return message.reply(

"❌ Utente non trovato."

);

}





await interaction.channel.permissionOverwrites.delete(

member.id

);





message.reply(

`✅ ${member} rimosso dal ticket.`

);



}

);



},








// =====================================
// RENAME
// =====================================


async renameHandler(interaction){



await interaction.reply({

content:

"✏️ Scrivi il nuovo nome del ticket.",

ephemeral:true

});





const collector = interaction.channel.createMessageCollector({

filter:

m => m.author.id === interaction.user.id,

max:1,

time:30000

});





collector.on(

"collect",

async message => {



await interaction.channel.setName(

`🎫・${message.content}`

);





message.reply(

"✅ Nome ticket cambiato."

);



}

);



},







// =====================================
// INFO TICKET
// =====================================


async infoHandler(interaction){



const data = ticketActivity.get(

interaction.channel.id

);



const priority = ticketPriority.get(

interaction.channel.id

)

|| "🟢 Basso";





return interaction.reply({

embeds:[

createEmbed(

"📊 Informazioni Ticket",

`

👤 Proprietario:

<@${data?.owner || "N/D"}>


📂 Categoria:

${data?.type || "N/D"}


📌 Priorità:

${priority}


🕒 Creato:

<t:${Math.floor(

(data?.created || Date.now()) /1000

)}:R>


`

)

]

});



},





// =====================================
// TRANSCRIPT
// =====================================


async transcriptHandler(interaction){



const file = await createTranscript(

interaction.channel

);





await interaction.reply({

content:

"📋 Transcript creato.",

files:[file],

ephemeral:true

});



},

    // =====================================
// CLOSE TICKET SYSTEM
// =====================================


async closeTicket(interaction){


const data = ticketActivity.get(
interaction.channel.id
);


const claimed = claimedTickets.get(
interaction.channel.id
);



const transcript =
await createTranscript(
interaction.channel
);



const logs =
interaction.guild.channels.cache.get(
LOG_CHANNEL_ID
);





if(logs){


await logs.send({

embeds:[

createEmbed(

"🔒 Ticket Chiuso",

`

👤 Chiuso da:

${interaction.user}


📂 Categoria:

${data?.type || "N/D"}


🙋 Staff assegnato:

${claimed ? `<@${claimed}>` : "Nessuno"}


📍 Canale:

${interaction.channel}

`

)

],


files:[transcript]

});


}





// DM VALUTAZIONE


try{


await data.owner && interaction.client.users.send(

data.owner,

{

embeds:[

createEmbed(

"⭐ Valuta la tua assistenza",

`

Il tuo ticket è stato chiuso.


👨‍💼 Staff:

${claimed ? `<@${claimed}>` : "Non assegnato"}


📂 Categoria:

${data?.type || "N/D"}


Come valuti l'assistenza?


Rispondi con un voto:

⭐ 1-5


Poi puoi lasciare una descrizione.


━━━━━━━━━━━━━━

Firma automatica:

⚜️ Elegance Support System

`

)

]

}


);



}catch(e){}





await interaction.reply({

content:

"🔒 Ticket chiuso. Grazie per averci contattato.",

ephemeral:true

});





setTimeout(()=>{


interaction.channel.delete()

.catch(()=>{})


},5000);



},







// =====================================
// BUTTON / MENU ROUTER
// =====================================


async router(interaction){



if(interaction.isStringSelectMenu()){


if(
interaction.customId === "ticket_management"
){

return this.menuHandler(
interaction
);


}



if(
interaction.customId === "ticket_priority"
){

return this.priorityHandler(
interaction
);


}


}





if(interaction.customId === "close_ticket"){

return this.closeTicket(
interaction
);

}



},








// =====================================
// AUTO ASSISTANCE QUESTIONS
// =====================================


async askQuestions(interaction,type){



const questions = {


partner:[

"Qual è il nome del tuo progetto/server?",

"Che tipo di collaborazione proponi?",

"Quanti membri avete?"

],



bug:[

"Descrivi il problema.",

"Quando si verifica?",

"Che dispositivo utilizzi?"

],



staff:[

"Perché vuoi entrare nello Staff?",

"Che esperienza hai?",

"Quanto tempo puoi dedicare?"

],



idea:[

"Qual è la tua idea?",

"Perché sarebbe utile?",

"Cosa miglioreresti?"

]


};





const selected =
questions[type] || [];





await interaction.reply({

embeds:[

createEmbed(

"🤖 Assistenza iniziale",

`

Ciao!


Non sono un AI.


Ma ho alcune funzionalità che possono aiutarti.


Rispondi alle domande iniziali.


Dopo le risposte il ticket verrà assegnato allo Staff.


`

)

],


ephemeral:true

});





for(
const question of selected
){


await interaction.followUp({

content:

`❓ ${question}`,

ephemeral:true

});



}




},








// =====================================
// EXPORT
// =====================================


};
