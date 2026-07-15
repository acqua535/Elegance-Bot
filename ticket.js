const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


// =====================================
// TRANSCRIPT MANAGER
// =====================================

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
// STORAGE
// =====================================

const ticketData = new Map();

const openTickets = new Map();


// =====================================
// STAFF CHECK
// =====================================

function isStaff(member){

    if(!member)
        return false;


    return TICKET_STAFF_ROLES.some(

        roleId => member.roles.cache.has(roleId)

    );

}



// =====================================
// MODULE EXPORT
// =====================================

module.exports = {


data:

new SlashCommandBuilder()

.setName("ticket")

.setDescription(
    "Apri un ticket di supporto"
),




// =====================================
// OPEN PANEL
// =====================================

async execute(interaction){


    const menu = new StringSelectMenuBuilder()


    .setCustomId(
        "ticket_category"
    )


    .setPlaceholder(
        "Seleziona il tipo di richiesta"
    )


    .addOptions([


        {
            label:"Supporto Partner",
            description:"Richieste partnership e collaborazioni",
            value:"partner"
        },


        {
            label:"Bando Staff",
            description:"Candidature staff",
            value:"staff"
        },


        {
            label:"Segnalazioni / Bug",
            description:"Segnala problemi o bug",
            value:"bug"
        },


        {
            label:"Idee / Suggerimenti",
            description:"Invia una proposta",
            value:"idea"
        }


    ]);




    const row = new ActionRowBuilder()

    .addComponents(

        menu

    );




    const embed = new EmbedBuilder()


    .setTitle(
        "🎫 Elegance Support"
    )


    .setDescription(
        "Seleziona la categoria del tuo ticket dal menu qui sotto."
    )


    .setTimestamp();





    await interaction.reply({

        embeds:[embed],

        components:[row]

    });



},



// =====================================
// CREATE TICKET
// =====================================

async categoryHandler(interaction){


    await interaction.deferReply({

        ephemeral:true

    });



    if(openTickets.has(interaction.user.id)){


        return interaction.editReply({

            content:

            "❌ Hai già un ticket aperto. Chiudi quello precedente prima di crearne un altro."

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

                id:interaction.guild.id,

                deny:[

                    PermissionFlagsBits.ViewChannel

                ]

            },


            {

                id:interaction.user.id,

                allow:[

                    PermissionFlagsBits.ViewChannel,

                    PermissionFlagsBits.SendMessages,

                    PermissionFlagsBits.ReadMessageHistory

                ]

            },


            ...TICKET_STAFF_ROLES.map(roleId => ({


                id:roleId,


                allow:[

                    PermissionFlagsBits.ViewChannel,

                    PermissionFlagsBits.SendMessages,

                    PermissionFlagsBits.ReadMessageHistory

                ]

            }))

        ]

    });

        openTickets.set(

        interaction.user.id,

        channel.id

    );




    ticketData.set(

        channel.id,

        {

            owner:

            interaction.user.id,


            type:

            type,


            claimedBy:

            null

        }

    );




// =====================================
// TICKET MANAGEMENT MENU
// =====================================


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

        value:"claim_ticket"

    },


    {

        label:"Informazioni Ticket",

        description:"Visualizza informazioni",

        value:"ticket_info"

    },


    {

        label:"Chiudi Ticket",

        description:"Genera transcript e chiude",

        value:"close_ticket"

    }


]);





const manageRow = new ActionRowBuilder()

.addComponents(

    manageMenu

);





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

📂 **Categoria**

${type}


Lo Staff risponderà appena possibile.


Usa il menu qui sotto per gestire il ticket.
`

        )



        .setTimestamp()



    ],



    components:[

        manageRow

    ]



});





const logs = interaction.guild.channels.cache.get(

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
👤 **Utente**

${interaction.user}


📌 **Canale**

${channel}


📂 **Categoria**

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
// TICKET MANAGEMENT ROUTER
// =====================================

async router(interaction){



    const option = interaction.values[0];




    if(option === "claim_ticket"){


        interaction.customId = "claim_ticket";


        return module.exports.buttonHandler(interaction);


    }





    if(option === "close_ticket"){


        interaction.customId = "close_ticket";


        return module.exports.buttonHandler(interaction);


    }





    if(option === "ticket_info"){



        const data = ticketData.get(

            interaction.channel.id

        );



        if(!data){


            return interaction.reply({


                content:

                "❌ Dati ticket non trovati.",


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

${data.claimedBy ? `<@${data.claimedBy}>` : "Nessuno"}
`

                )



                .setTimestamp()



            ],



            ephemeral:true



        });


    }



},

    
// =====================================
// BUTTON / MANAGEMENT HANDLER
// =====================================

async buttonHandler(interaction){



    const logs = interaction.guild.channels.cache.get(

        LOG_CHANNEL_ID

    );




    const data = ticketData.get(

        interaction.channel.id

    );




    if(!data){


        return interaction.reply({


            content:

            "❌ Ticket non trovato.",


            ephemeral:true


        });


    }





// =====================================
// CLAIM TICKET
// =====================================


if(interaction.customId === "claim_ticket"){



    if(!isStaff(interaction.member)){



        return interaction.reply({



            content:

            "❌ Solo lo Staff può reclamare ticket.",



            ephemeral:true



        });


    }





    if(data.claimedBy){



        return interaction.reply({



            content:

            `❌ Ticket già reclamato da <@${data.claimedBy}>.`,



            ephemeral:true



        });


    }





    data.claimedBy = interaction.user.id;



    ticketData.set(

        interaction.channel.id,

        data

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
👤 Staff

${interaction.user}


📌 Canale

${interaction.channel}
`

                )



                .setTimestamp()



            ]



        });



    }





    return;



}









// =====================================
// CLOSE TICKET
// =====================================


if(interaction.customId === "close_ticket"){



    const canClose =

        interaction.user.id === data.owner

        ||

        isStaff(interaction.member);






    if(!canClose){



        return interaction.reply({



            content:

            "❌ Non hai il permesso di chiudere questo ticket.",



            ephemeral:true



        });



    }







    await interaction.reply({



        content:

        "🔒 Ticket in chiusura. Creazione transcript HTML...",



        ephemeral:false



    });






    let transcriptFile;





    try {



        transcriptFile = await transcriptManager.createTranscript(

            interaction.channel

        );



    } catch(error) {



        console.error(

            "❌ Errore transcript:",

            error

        );





        return interaction.followUp({



            content:

            "❌ Errore durante la creazione del transcript.",



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
👤 **Chiuso da**

${interaction.user}


📌 **Canale**

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








    openTickets.delete(

        data.owner

    );





    ticketData.delete(

        interaction.channel.id

    );







    setTimeout(()=>{



        interaction.channel.delete()

        .catch(()=>{});



    },3000);






    return;



}



}



};
