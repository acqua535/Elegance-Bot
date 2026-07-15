const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


// =====================================
// SYSTEMS
// =====================================

const transcriptManager = require("./transcript");

const ticketSystem = require("./ticketSystem");




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

        roleId => member.roles.cache.has(roleId)

    );


}





// =====================================
// MODULE
// =====================================

module.exports = {





// =====================================
// SLASH COMMAND
// =====================================


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

        "🎫 Seleziona il tipo di richiesta"

    )



    .addOptions([



        {

            label:

            "Supporto Partner",


            description:

            "Richieste partnership e collaborazioni",


            value:

            "partner",


            emoji:

            "🤝"

        },





        {

            label:

            "Bando Staff",


            description:

            "Candidature per entrare nello staff",


            value:

            "staff",


            emoji:

            "🛡️"

        },





        {

            label:

            "Segnalazioni / Bug",


            description:

            "Segnala problemi o bug",


            value:

            "bug",


            emoji:

            "🐞"

        },





        {

            label:

            "Idee / Suggerimenti",


            description:

            "Invia una proposta alla community",


            value:

            "idea",


            emoji:

            "💡"

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

`
Benvenuto nel sistema Ticket di Elegance.

Seleziona dal menu qui sotto il motivo della richiesta.

Lo Staff risponderà il prima possibile.
`

    )



    .setTimestamp();







    await interaction.reply({



        embeds:[

            embed

        ],



        components:[

            row

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






    // ===============================
    // CHECK EXISTING
    // ===============================



    if(

        ticketSystem.hasOpenTicket(

            interaction.user.id

        )

    ){



        return interaction.editReply({



            content:

            "❌ Hai già un ticket aperto. Chiudi quello precedente prima di crearne un altro."



        });



    }






    const type = interaction.values[0];







    const names = {


        partner:

        "supporto-partner",


        staff:

        "bando-staff",


        bug:

        "segnalazione-bug",


        idea:

        "idee-suggerimenti"



    };







    // ===============================
    // CREATE CHANNEL
    // ===============================



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






            // USER


            {

                id:

                interaction.user.id,


                allow:[


                    PermissionFlagsBits.ViewChannel,


                    PermissionFlagsBits.SendMessages,


                    PermissionFlagsBits.ReadMessageHistory


                ]

            },






            // BOT


            {

                id:

                interaction.client.user.id,


                allow:[


                    PermissionFlagsBits.ViewChannel,


                    PermissionFlagsBits.SendMessages,


                    PermissionFlagsBits.EmbedLinks,


                    PermissionFlagsBits.ReadMessageHistory


                ]

            },






            // STAFF


            ...TICKET_STAFF_ROLES.map(roleId => ({



                id:

                roleId,



                allow:[


                    PermissionFlagsBits.ViewChannel,


                    PermissionFlagsBits.SendMessages,


                    PermissionFlagsBits.ReadMessageHistory


                ]



            }))





        ]



    });







    // SALVATAGGIO JSON


    ticketSystem.saveTicket(

        interaction.user.id,

        {

            channelId:

            channel.id,


            owner:

            interaction.user.id,


            type:

            type,


            claimedBy:

            null,


            createdAt:

            Date.now()


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

            label:

            "Reclama Ticket",


            description:

            "Prendi in carico la richiesta",


            value:

            "claim_ticket",


            emoji:

            "🙋"

        },





        {

            label:

            "Informazioni Ticket",


            description:

            "Mostra i dati del ticket",


            value:

            "ticket_info",


            emoji:

            "📋"

        },





        {

            label:

            "Chiudi Ticket",


            description:

            "Genera transcript e chiude",


            value:

            "close_ticket",


            emoji:

            "🔒"

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

📂 Categoria:
**${type}**

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

        // =====================================
    // LOG CREAZIONE
    // =====================================


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






    // =====================================
    // CLAIM
    // =====================================


    if(option === "claim_ticket"){



        interaction.customId = "claim_ticket";



        return module.exports.buttonHandler(

            interaction

        );



    }







    // =====================================
    // CLOSE
    // =====================================


    if(option === "close_ticket"){



        interaction.customId = "close_ticket";



        return module.exports.buttonHandler(

            interaction

        );



    }







    // =====================================
    // INFO
    // =====================================


    if(option === "ticket_info"){



        const ticket = ticketSystem.getTicket(

            interaction.user.id

        );






        if(!ticket){



            return interaction.reply({



                content:

                "❌ Informazioni ticket non trovate.",



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

<@${ticket.owner}>


📂 **Categoria**

${ticket.type}


🙋 **Staff assegnato**

${ticket.claimedBy ? `<@${ticket.claimedBy}>` : "Nessuno"}


🕒 **Creato**

<t:${Math.floor(ticket.createdAt / 1000)}:R>
`

                )



                .setTimestamp()



            ],



            ephemeral:true



        });



    }







    }

    
// =====================================
// BUTTON / MANAGEMENT HANDLER
// =====================================


async buttonHandler(interaction){



    const ticket = ticketSystem.getTicketByChannel(

        interaction.channel.id

    );





    const logs = interaction.guild.channels.cache.get(

        LOG_CHANNEL_ID

    );






    if(!ticket){



        return interaction.reply({



            content:

            "❌ Questo ticket non è registrato.",



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

            "❌ Solo lo Staff può reclamare un ticket.",



            ephemeral:true



        });



    }







    if(ticket.claimedBy){



        return interaction.reply({



            content:

            `❌ Ticket già reclamato da <@${ticket.claimedBy}>.`,



            ephemeral:true



        });



    }








    ticket.claimedBy = interaction.user.id;





    ticketSystem.updateTicket(

        ticket.owner,

        ticket

    );








    await interaction.reply({



        content:

        `🙋 Ticket preso in carico da ${interaction.user}.`



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



        interaction.user.id === ticket.owner

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

        "🔒 Ticket in chiusura. Creazione transcript...",



        ephemeral:false



    });








    let transcriptFile;







    try {



        transcriptFile = await transcriptManager.createTranscript(

            interaction.channel

        );



    } catch(error){



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








    ticketSystem.deleteTicket(

        ticket.owner

    );









    setTimeout(()=>{



        interaction.channel.delete()

        .catch(()=>{});



    },3000);







    return;



}



}



};
