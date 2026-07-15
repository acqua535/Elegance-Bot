const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");



const ticketSystem = require("./ticketSystem");

const transcriptManager = require("./transcript");




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
// STAFF CHECK
// =====================================


function isStaff(member){

    if(!member)
        return false;


    return TICKET_STAFF_ROLES.some(

        id => member.roles.cache.has(id)

    );

}





module.exports = {



// =====================================
// COMMAND
// =====================================


data:

new SlashCommandBuilder()

.setName("ticket")

.setDescription(
"Apri un ticket di supporto"
),






// =====================================
// PANEL
// =====================================


async execute(interaction){


const menu = new StringSelectMenuBuilder()

.setCustomId(
"ticket_category"
)

.setPlaceholder(
"🎫 Seleziona categoria ticket"
)

.addOptions([


{
label:"Supporto Partner",
description:"Partnership e collaborazioni",
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
description:"Segnala un problema",
value:"bug",
emoji:"🐞"
},


{
label:"Idee / Suggerimenti",
description:"Invia una proposta",
value:"idea",
emoji:"💡"
}


]);




await interaction.reply({


embeds:[

new EmbedBuilder()

.setTitle(
"🎫 Elegance Support"
)

.setDescription(

`
Benvenuto nel sistema ticket.

Seleziona il tipo di richiesta dal menu qui sotto.

Lo Staff risponderà appena possibile.
`

)

.setTimestamp()

],


components:[

new ActionRowBuilder()

.addComponents(menu)

]


});


},







// =====================================
// CREATE TICKET
// =====================================


async categoryHandler(interaction){


await interaction.deferReply({

ephemeral:true

});




if(

ticketSystem.hasOpenTicket(

interaction.user.id

)

){


return interaction.editReply({

content:
"❌ Hai già un ticket aperto."

});


}




const type = interaction.values[0];



const names = {


partner:"supporto-partner",

staff:"bando-staff",

bug:"segnalazione-bug",

idea:"idee-suggerimenti"


};






const channel = await interaction.guild.channels.create({


name:

`🎫・┆${names[type]}-${interaction.user.username}`,


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



{

id:
interaction.client.user.id,

allow:[

PermissionFlagsBits.ViewChannel,

PermissionFlagsBits.SendMessages,

PermissionFlagsBits.ReadMessageHistory,

PermissionFlagsBits.EmbedLinks

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





ticketSystem.createTicket(

interaction.user.id,

{

owner: interaction.user.id,

channelId: channel.id,

type:type,

claimedBy:null,

createdAt:Date.now()

}

);






const manageMenu = new StringSelectMenuBuilder()

.setCustomId(
"ticket_manage"
)

.setPlaceholder(
"⚙️ Gestione Ticket"
)

.addOptions([


{

label:"Reclama Ticket",

description:"Prendi in carico il ticket",

value:"claim_ticket",

emoji:"🙋"

},



{

label:"Informazioni Ticket",

description:"Visualizza informazioni",

value:"ticket_info",

emoji:"📋"

},



{

label:"Chiudi Ticket",

description:"Chiudi il ticket",

value:"close_ticket",

emoji:"🔒"

}


]);







await channel.send({


content:

`<@${interaction.user.id}>`,



embeds:[

new EmbedBuilder()

.setTitle(
"🎫 Ticket Aperto"
)

.setDescription(

`
Benvenuto nel tuo ticket.

📂 Categoria:
**${type}**

Lo Staff risponderà appena possibile.

Usa il menu per gestire il ticket.
`

)

.setTimestamp()

],



components:[

new ActionRowBuilder()

.addComponents(manageMenu)

]


});






const logs =
interaction.guild.channels.cache.get(

LOG_CHANNEL_ID

);



if(logs){


await logs.send({

embeds:[

new EmbedBuilder()

.setTitle(
"🎫 Ticket Creato"
)

.setDescription(

`
👤 Utente:
${interaction.user}

📌 Canale:
${channel}

📂 Categoria:
${type}
`

)

.setTimestamp()

]


});


}




await interaction.editReply({

content:

`✅ Ticket creato: ${channel}`

});



},

// =====================================
// ROUTER MENU
// =====================================

async router(interaction){


    try {


        const option = interaction.values[0];



        console.log(
            "🎫 Ticket menu:",
            option
        );



        if(option === "claim_ticket"){


            interaction.customId = "claim_ticket";


            return module.exports.buttonHandler(
                interaction
            );


        }




        if(option === "close_ticket"){


            interaction.customId = "close_ticket";


            return module.exports.buttonHandler(
                interaction
            );


        }





        if(option === "ticket_info"){



            const data =
            ticketSystem.getTicket(
                interaction.user.id
            );



            if(!data){


                return interaction.reply({

                    content:
                    "❌ Ticket non trovato.",

                    ephemeral:true

                });


            }




            return interaction.reply({


                embeds:[


                    new EmbedBuilder()


                    .setTitle(
                        "📋 Informazioni Ticket"
                    )


                    .setDescription(

`
👤 **Proprietario**

<@${data.owner}>


📂 **Categoria**

${data.type}


🙋 **Staff assegnato**

${data.claimedBy 
? `<@${data.claimedBy}>`
: "Nessuno"}


🕒 **Creato**

<t:${Math.floor(data.createdAt / 1000)}:R>
`

                    )


                    .setTimestamp()


                ],


                ephemeral:true


            });


        }





    } catch(error){


        console.error(
            "❌ Errore router ticket:",
            error
        );



        if(
            !interaction.replied &&
            !interaction.deferred
        ){


            await interaction.reply({

                content:
                "❌ Errore gestione ticket.",

                ephemeral:true

            }).catch(()=>{});


        }


    }


},






// =====================================
// BUTTON HANDLER
// =====================================

async buttonHandler(interaction){



try {



const ticketData =

ticketSystem.getTicket(

    interaction.user.id

);





if(!ticketData){



return interaction.reply({


content:

"❌ Ticket non trovato nel sistema.",


ephemeral:true


});


}







const logs =

interaction.guild.channels.cache.get(

LOG_CHANNEL_ID

);







// ===============================
// CLAIM
// ===============================


if(

interaction.customId === "claim_ticket"

){



if(!isStaff(interaction.member)){



return interaction.reply({


content:

"❌ Solo lo Staff può reclamare ticket.",


ephemeral:true


});


}





if(ticketData.claimedBy){



return interaction.reply({


content:

`❌ Ticket già reclamato da <@${ticketData.claimedBy}>.`,


ephemeral:true


});


}





ticketData.claimedBy =
interaction.user.id;



ticketSystem.updateTicket(

ticketData.owner,

ticketData

);





await interaction.reply({


content:

`🙋 Ticket reclamato da ${interaction.user}.`


});





if(logs){


await logs.send({


embeds:[


new EmbedBuilder()


.setTitle(
"🙋 Ticket Reclamato"
)


.setDescription(

`
👤 Staff:

${interaction.user}


📌 Ticket:

${interaction.channel}
`

)


.setTimestamp()


]


});


}




return;


}








// ===============================
// CLOSE
// ===============================


if(

interaction.customId === "close_ticket"

){



const allowed =

interaction.user.id === ticketData.owner

||

isStaff(interaction.member);





if(!allowed){


return interaction.reply({


content:

"❌ Non puoi chiudere questo ticket.",


ephemeral:true


});


}






await interaction.reply({


content:

"🔒 Chiusura ticket in corso...",


ephemeral:true


});







let transcriptFile;



try{


transcriptFile =

await transcriptManager.createTranscript(

interaction.channel

);



}catch(error){



console.error(
"Transcript error:",
error
);



return interaction.followUp({


content:

"❌ Errore creazione transcript.",


ephemeral:true


});


}







if(logs){



await logs.send({



embeds:[



new EmbedBuilder()


.setTitle(
"🔒 Ticket Chiuso"
)


.setDescription(

`
👤 Chiuso da:

${interaction.user}


📌 Canale:

${interaction.channel}


📝 Transcript generato.
`

)


.setTimestamp()


],


files:[

transcriptFile

]


});



}





ticketSystem.deleteTicket(

ticketData.owner

);






setTimeout(()=>{


interaction.channel.delete()

.catch(()=>{});


},3000);





return;


}





}catch(error){



console.error(

"❌ Errore button ticket:",

error

);



if(

!interaction.replied &&

!interaction.deferred

){


await interaction.reply({


content:

"❌ Errore pulsante ticket.",


ephemeral:true


}).catch(()=>{});


}



}



}

};
