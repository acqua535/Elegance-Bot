const {

    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
    PermissionFlagsBits,
    AttachmentBuilder

} = require("discord.js");


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
// STORAGE
// =====================================

const tickets = new Map();

const claimedTickets = new Map();

const ticketPriority = new Map();


// =====================================
// EMBED SYSTEM
// =====================================

function createEmbed(
    title,
    description,
    color = "Gold"
){

    return new EmbedBuilder()

        .setTitle(title)

        .setDescription(description)

        .setColor(color)

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

        "Qual è la tua esperienza nello Staff?",

        "Perché vuoi entrare nel team?",

        "Quanto tempo puoi dedicare?"

    ],



    bug:[

        "Descrivi il problema riscontrato.",

        "Quando succede il problema?",

        "Hai screenshot o prove?"

    ],



    idea:[

        "Qual è la tua idea?",

        "Come migliorerebbe il server?",

        "Hai altri dettagli?"

    ]

};




// =====================================
// AUTO QUESTIONS
// =====================================

async function askTicketQuestions(
    interaction,
    type
){


    const questions =
    ticketQuestions[type];


    let answers = [];



    await interaction.followUp({

        embeds:[

            createEmbed(

                "🤖 Assistenza iniziale",

                `
Ciao!

Prima della creazione del ticket ti farò alcune domande automatiche.

Rispondi normalmente.

Le risposte verranno mostrate allo Staff.

`

            )

        ],

        ephemeral:true

    });




    for(
        const question of questions
    ){


        await interaction.followUp({

            content:

            `❓ ${question}`,

            ephemeral:true

        });



        const message =
        await interaction.channel.awaitMessages({

            filter:

            msg =>
            msg.author.id === interaction.user.id,

            max:1,

            time:60000

        }).catch(()=>null);



        if(message){

            answers.push(

                message.first().content

            );

        }


    }



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

        "🎫 Seleziona categoria"

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

            description:"Candidatura Staff",

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

            description:"Suggerimenti community",

            value:"idea",

            emoji:"💡"

        }


    ]);



    await interaction.reply({

        embeds:[

            createEmbed(

                "🎫 Elegance Support",

                `
Benvenuto nel supporto ufficiale.

Seleziona la categoria del tuo ticket.

`

            )

        ],


        components:[

            new ActionRowBuilder()

            .addComponents(menu)

        ]

    });


},

    // =====================================
// CATEGORY HANDLER
// =====================================


async categoryHandler(interaction){


    await interaction.deferReply({

        ephemeral:true

    });



    const type =
    interaction.values[0];



    const answers =
    await askTicketQuestions(

        interaction,

        type

    );



    const names = {


        partner:"supporto-partner",

        staff:"bando-staff",

        bug:"segnalazione-bug",

        idea:"idee"

    };





    const channel =
    await interaction.guild.channels.create({



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



            ...TICKET_STAFF_ROLES.map(role => ({


                id:role,


                allow:[

                    PermissionFlagsBits.ViewChannel,

                    PermissionFlagsBits.SendMessages,

                    PermissionFlagsBits.ReadMessageHistory

                ]


            }))

        ]



    });





    ticketPriority.set(

        channel.id,

        "🟢 Basso"

    );





    tickets.set(

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
// MANAGEMENT MENU
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

description:"Trasferisci il ticket",

value:"transfer",

emoji:"🔄"

},



{

label:"Cambia priorità",

description:"Modifica urgenza ticket",

value:"priority",

emoji:"📌"

},



{

label:"Aggiungi membro",

description:"Aggiungi un utente",

value:"add_member",

emoji:"👥"

},



{

label:"Rimuovi membro",

description:"Rimuovi un utente",

value:"remove_member",

emoji:"🚫"

},



{

label:"Cambia nome",

description:"Rinomina il ticket",

value:"rename",

emoji:"✏️"

},



{

label:"Transcript",

description:"Crea copia conversazione",

value:"transcript",

emoji:"📋"

},



{

label:"Informazioni",

description:"Mostra dati ticket",

value:"info",

emoji:"📊"

},



{

label:"Chiudi",

description:"Chiude il ticket",

value:"close",

emoji:"🔒"

}



]);






// =====================================
// TICKET EMBED
// =====================================


const ticketEmbed = new EmbedBuilder()


.setTitle(

"🎫 Ticket Aperto"

)


.setDescription(

`

Benvenuto nel tuo ticket.

Lo Staff risponderà appena possibile.


━━━━━━━━━━━━━━


👤 Utente:

${interaction.user}



📂 Categoria:

${type}



📌 Priorità:

🟢 Basso



━━━━━━━━━━━━━━


Utilizza il menu qui sotto per gestire il ticket.


`

)


.setColor("Green")


.setTimestamp();







await channel.send({



content:


`${interaction.user} ${TICKET_STAFF_ROLES.map(role=>`<@&${role}>`).join(" ")}`,



embeds:[

ticketEmbed

],



components:[

new ActionRowBuilder()

.addComponents(

managementMenu

)

]

});






// =====================================
// LOG CREAZIONE
// =====================================


const logs =

interaction.guild.channels.cache.get(

LOG_CHANNEL_ID

);



if(logs){



await logs.send({

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


    const value =
    interaction.values[0];



    // =================================
    // CLAIM
    // =================================


    if(value === "claim"){



        const allowed =

        TICKET_STAFF_ROLES.some(

            role =>

            interaction.member.roles.cache.has(role)

        );



        if(!allowed){

            return interaction.reply({

                content:

                "❌ Non puoi reclamare questo ticket.",

                ephemeral:true

            });

        }



        claimedTickets.set(

            interaction.channel.id,

            interaction.user.id

        );



        return interaction.reply({

            embeds:[

                createEmbed(

                    "👤 Ticket Reclamato",

                    `

Questo ticket è stato preso in gestione da:

${interaction.user}

                    `,

                    "Blue"

                )

            ]

        });



    }






    // =================================
    // TRANSFER
    // =================================


    if(value === "transfer"){



        claimedTickets.delete(

            interaction.channel.id

        );



        return interaction.reply({

            embeds:[

                createEmbed(

                    "🔄 Ticket Disponibile",

                    `

Il ticket è stato rimosso dall'attuale Staff.

Un altro membro potrà reclamarlo.

                    `,

                    "Orange"

                )

            ]

        });


    }







    // =================================
    // PRIORITY MENU
    // =================================


    if(value === "priority"){



        const menu = new StringSelectMenuBuilder()



        .setCustomId(

            "ticket_priority"

        )



        .setPlaceholder(

            "📌 Seleziona priorità"

        )



        .addOptions([


            {

                label:"Basso",

                value:"low",

                emoji:"🟢"

            },


            {

                label:"Medio",

                value:"medium",

                emoji:"🟠"

            },


            {

                label:"Alto",

                value:"high",

                emoji:"🔴"

            }



        ]);



        return interaction.reply({

            components:[

                new ActionRowBuilder()

                .addComponents(menu)

            ],


            ephemeral:true


        });



    }







    // =================================
    // ADD MEMBER
    // =================================


    if(value === "add_member"){



        return interaction.reply({

            content:

            "👥 Menziona l'utente da aggiungere.",

            ephemeral:true

        });



    }







    // =================================
    // REMOVE MEMBER
    // =================================


    if(value === "remove_member"){



        return interaction.reply({

            content:

            "🚫 Menziona l'utente da rimuovere.",

            ephemeral:true

        });


    }







    // =================================
    // RENAME
    // =================================


    if(value === "rename"){



        return interaction.reply({

            content:

            "✏️ Scrivi il nuovo nome del ticket.",

            ephemeral:true

        });


    }







    // =================================
    // INFO
    // =================================


    if(value === "info"){



        const data =

        tickets.get(

            interaction.channel.id

        );



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

${ticketPriority.get(

interaction.channel.id

) || "🟢 Basso"}


🕒 Creato:

<t:${Math.floor(

(data?.created || Date.now()) / 1000

)}:R>


                    `

                )

            ],

            ephemeral:true

        });


    }








    // =================================
    // TRANSCRIPT
    // =================================


    if(value === "transcript"){


        return this.createTranscript(

            interaction

        );


    }







    // =================================
    // CLOSE
    // =================================


    if(value === "close"){


        return this.closeTicket(

            interaction

        );


    }


},







// =====================================
// PRIORITY HANDLER
// =====================================


async priorityHandler(interaction){



    const value =

    interaction.values[0];



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





    const messages =

    await interaction.channel.messages.fetch({

        limit:10

    });





    const message =

    messages.find(

        msg =>

        msg.author.id === interaction.client.user.id &&

        msg.embeds.length

    );





    if(message){



        const oldEmbed =

        message.embeds[0];



        const newEmbed =

        EmbedBuilder.from(oldEmbed)

        .setColor(color)

        .setDescription(

            oldEmbed.description.replace(

                /📌 Priorità:\n.*/,

                `📌 Priorità:\n${priority}`

            )

        );



        await message.edit({

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
// PROFESSIONAL HTML TRANSCRIPT
// =====================================


async createTranscript(interaction){


    await interaction.deferReply({

        ephemeral:true

    });



    let messages = [];

    let lastId;



    while(true){


        const options = {

            limit:100

        };



        if(lastId){

            options.before = lastId;

        }



        const fetched =

        await interaction.channel.messages.fetch(options);



        if(fetched.size === 0){

            break;

        }



        messages.push(

            ...fetched.values()

        );



        lastId = fetched.last().id;


    }





    messages.sort(

        (a,b)=>

        a.createdTimestamp -

        b.createdTimestamp

    );





    let html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>

Ticket Transcript

</title>


<style>


body{

background:#313338;

color:white;

font-family:Arial;

padding:20px;

}


.header{

background:#5865F2;

padding:20px;

border-radius:12px;

margin-bottom:20px;

}


.message{

background:#2b2d31;

padding:15px;

border-radius:10px;

margin-bottom:12px;

}


.author{

font-weight:bold;

color:#00aff4;

}


.time{

font-size:12px;

color:#aaa;

}


.content{

margin-top:8px;

white-space:pre-wrap;

}


.embed{

border-left:4px solid #5865F2;

padding-left:10px;

margin-top:10px;

}


img{

max-width:400px;

border-radius:8px;

}


</style>


</head>


<body>



<div class="header">


<h2>

🎫 Elegance Ticket Transcript

</h2>


<p>

Canale:

${interaction.channel.name}

</p>


<p>

Creato:

${new Date().toLocaleString()}

</p>


</div>


`;







for(const msg of messages){



html += `


<div class="message">


<div class="author">

${msg.author.tag}

(ID: ${msg.author.id})

</div>


<div class="time">

${new Date(msg.createdTimestamp).toLocaleString()}

</div>


<div class="content">

${msg.content || "*Nessun contenuto*"}

</div>


`;





if(msg.attachments.size){


msg.attachments.forEach(file=>{


html += `


<br>

📎 Allegato:

<a href="${file.url}" target="_blank">

${file.name}

</a>


`;


});


}







if(msg.embeds.length){


msg.embeds.forEach(embed=>{


html += `


<div class="embed">


<b>

${embed.title || "Embed"}

</b>


<br>


${embed.description || ""}


</div>


`;


});


}





html += `

</div>

`;



}






html += `


</body>

</html>

`;






const file = new AttachmentBuilder(

Buffer.from(html),

{

name:

`transcript-${interaction.channel.name}.html`

}

);





await interaction.editReply({

content:

"📋 Transcript HTML creato.",

files:[file]

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

        m =>

        m.author.id === interaction.user.id,

        max:1,

        time:30000

    });





    collector.on(

        "collect",

        async message => {



            const member =

            message.mentions.members.first();





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

        m =>

        m.author.id === interaction.user.id,

        max:1,

        time:30000

    });





    collector.on(

        "collect",

        async message => {



            const member =

            message.mentions.members.first();





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
// RENAME TICKET
// =====================================


async renameHandler(interaction){



    await interaction.reply({

        content:

        "✏️ Scrivi il nuovo nome del ticket.",

        ephemeral:true

    });





    const collector = interaction.channel.createMessageCollector({

        filter:

        m =>

        m.author.id === interaction.user.id,

        max:1,

        time:30000

    });





    collector.on(

        "collect",

        async message => {



            const name =

            message.content

            .toLowerCase()

            .replace(/[^a-z0-9-_]/g,"-");





            await interaction.channel.setName(

                `🎫・${name}`

            );





            message.reply(

                "✅ Nome ticket cambiato."

            );


        }

    );


},







// =====================================
// CLOSE TICKET
// =====================================


async closeTicket(interaction){



    const data =

    tickets.get(

        interaction.channel.id

    );





    const staff =

    claimed.get(

        interaction.channel.id

    );





    let messages = [];

    let lastId;





    while(true){



        const fetched =

        await interaction.channel.messages.fetch({

            limit:100,

            ...(lastId && {

                before:lastId

            })

        });





        if(!fetched.size){

            break;

        }





        messages.push(

            ...fetched.values()

        );





        lastId =

        fetched.last().id;


    }





    messages.sort(

        (a,b)=>

        a.createdTimestamp -

        b.createdTimestamp

    );





    let html = `

<html>

<head>

<meta charset="UTF-8">


<style>

body{

background:#313338;

color:white;

font-family:Arial;

padding:20px;

}


.message{

background:#2b2d31;

padding:12px;

margin:10px;

border-radius:10px;

}


.author{

color:#00aff4;

font-weight:bold;

}


</style>


</head>


<body>


<h1>

🔒 Ticket Chiuso

</h1>


`;





    messages.forEach(msg=>{


        html += `


<div class="message">


<div class="author">

${msg.author.tag}

</div>


<div>

${msg.content || ""}

</div>


</div>


`;


    });





    html += `

</body>

</html>

`;





    const transcript =

    new AttachmentBuilder(

        Buffer.from(html),

        {

            name:

            `ticket-${interaction.channel.name}.html`

        }

    );







    const logs =

    interaction.guild.channels.cache.get(

        LOG_CHANNEL_ID

    );





    if(logs){



        await logs.send({

            embeds:[

                embed(

                    "🔒 Ticket Chiuso",

                    `

👤 Chiuso da:

${interaction.user}


📂 Categoria:

${data?.type || "N/D"}


👨‍💼 Staff:

${staff ? `<@${staff}>` : "Nessuno"}


📍 Canale:

${interaction.channel}

                    `,

                    "Red"

                )

            ],

            files:[transcript]

        });


    }







    try{



        const user =

        await interaction.client.users.fetch(

            data.owner

        );





        await user.send({

            embeds:[

                embed(

                    "⭐ Valuta assistenza",

                    `

Il tuo ticket è stato chiuso.


👨‍💼 Staff:

${staff ? `<@${staff}>` : "Non assegnato"}


📂 Categoria:

${data?.type || "N/D"}


Valuta il supporto da ⭐ 1 a ⭐ 5.


⚜️ Elegance Support System

                    `

                )

            ]

        });


    }

    catch(error){}





    await interaction.reply({

        content:

        "🔒 Ticket chiuso correttamente.",

        ephemeral:true

    });





    setTimeout(()=>{


        interaction.channel.delete()

        .catch(()=>{})


    },5000);


},

    // =====================================
// ROUTER
// =====================================


async router(interaction){



    if(interaction.isStringSelectMenu()){



        // ==========================
        // MENU GESTIONE TICKET
        // ==========================


        if(
            interaction.customId === "ticket_manage"
        ){



            const value = interaction.values[0];



            switch(value){



                case "add":


                    return this.addMemberHandler(

                        interaction

                    );




                case "remove":


                    return this.removeMemberHandler(

                        interaction

                    );




                case "rename":


                    return this.renameHandler(

                        interaction

                    );




                case "transcript":


                    return this.createTranscript(

                        interaction

                    );




                case "close":


                    return this.closeTicket(

                        interaction

                    );




                case "claim":


                    return this.menuHandler(

                        interaction

                    );




                case "priority":


                    return this.menuHandler(

                        interaction

                    );



            }


        }






        // ==========================
        // PRIORITY MENU
        // ==========================


        if(

            interaction.customId === "ticket_priority"

        ){


            return this.priorityHandler(

                interaction

            );


        }



    }



},







// =====================================
// EXPORT
// =====================================


};
