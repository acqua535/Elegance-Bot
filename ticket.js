const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


const fs = require("fs");


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
// TICKETS DATABASE
// =====================================

const TICKETS_FILE = "./ticketsData.json";



function loadTickets(){


    if(!fs.existsSync(TICKETS_FILE)){


        fs.writeFileSync(

            TICKETS_FILE,

            "{}"

        );


    }



    return JSON.parse(

        fs.readFileSync(

            TICKETS_FILE,

            "utf8"

        )

    );


}





function saveTickets(data){


    fs.writeFileSync(

        TICKETS_FILE,


        JSON.stringify(

            data,

            null,

            4

        )


    );


}






// =====================================
// STAFF CHECK
// =====================================

function isStaff(member){


    if(!member)

        return false;



    return TICKET_STAFF_ROLES.some(

        role =>

        member.roles.cache.has(role)

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
// OPEN TICKET PANEL
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

            "Candidature staff",

            value:

            "staff",

            emoji:

            "🛡️"

        },



        {

            label:

            "Segnalazioni e/o Bug",

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

            "Invia una proposta",

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

        "🎫 Supporto"

    )



    .setDescription(

        "Seleziona la categoria del tuo ticket dal menu."

    )



    .setTimestamp();






    await interaction.reply({

        embeds:[embed],

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







    // =====================================
    // CONTROLLO TICKET ESISTENTE
    // =====================================


    const tickets = loadTickets();




    if(tickets[interaction.user.id]){



        return interaction.editReply({



            content:

            "❌ Hai già un ticket aperto. Chiudi quello precedente prima di crearne un altro."



        });



    }









    // =====================================
    // CREAZIONE CANALE
    // =====================================


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








    // =====================================
    // SALVATAGGIO DATABASE
    // =====================================



    tickets[interaction.user.id] = {



        channelId:

        channel.id,



        type:

        type,



        claimedBy:

        null,



        createdAt:

        Date.now()



    };




    saveTickets(tickets);









    // =====================================
    // BUTTONS
    // =====================================



    const buttons = new ActionRowBuilder()

    .addComponents([





        new ButtonBuilder()

        .setCustomId(

            "claim_ticket"

        )

        .setLabel(

            "Reclama"

        )

        .setStyle(

            ButtonStyle.Primary

        ),






        new ButtonBuilder()

        .setCustomId(

            "close_ticket"

        )

        .setLabel(

            "Chiudi"

        )

        .setStyle(

            ButtonStyle.Danger

        )





    ]);








    await channel.send({



        content:

        `<@${interaction.user.id}>`,




        embeds:[



            new EmbedBuilder()



            .setTitle(

                "Ticket Aperto"

            )



            .setDescription(


                "Lo Staff risponderà appena possibile.\n\nUsa i bottoni qui sotto per gestire il ticket."

            )



            .setTimestamp()



        ],





        components:[buttons]



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


                    `👤 Utente\n${interaction.user}\n\n📌 Canale\n${channel}`


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
// BUTTON HANDLER
// =====================================


async buttonHandler(interaction){



    const logs = interaction.guild.channels.cache.get(

        LOG_CHANNEL_ID

    );




    const tickets = loadTickets();




    const ticket = tickets[interaction.user.id];







    // =====================================
    // CLAIM TICKET
    // =====================================


    if(interaction.customId === "claim_ticket"){





        if(!isStaff(interaction.member)){



            return interaction.reply({



                content:

                "❌ Solo lo Staff può reclamare i ticket.",



                ephemeral:true



            });



        }







        await interaction.reply({



            content:

            `🙋 Ticket reclamato da ${interaction.user}.`,



            ephemeral:false



        });








        if(logs){



            await logs.send({



                embeds:[



                    new EmbedBuilder()



                    .setTitle(

                        "🙋 Ticket Reclamato"

                    )



                    .setDescription(


                        `👤 Staff\n${interaction.user}\n\n📌 Canale\n${interaction.channel}`


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





        const owner = Object.keys(tickets).find(


            userId =>

            tickets[userId].channelId === interaction.channel.id


        );






        if(!owner && !isStaff(interaction.member)){



            return interaction.reply({



                content:

                "❌ Questo ticket non è riconosciuto.",



                ephemeral:true



            });



        }







        if(

            interaction.user.id !== owner &&

            !isStaff(interaction.member)

        ){



            return interaction.reply({



                content:

                "❌ Non hai il permesso di chiudere questo ticket.",



                ephemeral:true



            });



        }







        await interaction.reply({



            content:

            "🔒 Ticket chiuso. Creazione transcript HTML...",



            ephemeral:false



        });







        let transcriptFile;







        try {



            transcriptFile = await transcriptManager.createTranscript(


                interaction.channel


            );



        } catch(error){



            console.error(

                "Errore transcript:",

                error

            );



            return interaction.followUp({



                content:

                "❌ Errore nella creazione del transcript.",



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


                        `👤 Chiuso da\n${interaction.user}\n\n📌 Canale\n${interaction.channel}`


                    )



                    .setTimestamp()



                ],




                files:[

                    transcriptFile

                ]



            });



        }









        // RIMOZIONE DAL DATABASE


        if(owner){



            delete tickets[owner];


            saveTickets(tickets);



        }









        setTimeout(()=>{



            interaction.channel.delete()

            .catch(()=>{});



        },3000);







        return;



    }



}



};
