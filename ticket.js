// =====================================
// IMPORTS
// =====================================

const {

    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType,
    PermissionFlagsBits

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
// STAFF CHECK
// =====================================

function isStaff(member){

    if(!member)
        return false;


    return TICKET_STAFF_ROLES.some(

        role => member.roles.cache.has(role)

    );

}


// =====================================
// MODULE EXPORT
// =====================================

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
// EXECUTE
// =====================================

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

Benvenuto nel sistema ticket ufficiale.


Seleziona la categoria del tuo ticket.


━━━━━━━━━━━━━━


🤝 Partner

Collaborazioni e partnership.


🛡️ Staff

Candidature Staff.


🐞 Bug

Segnalazioni tecniche.


💡 Idee

Suggerimenti community.

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


    const type = interaction.values[0];


    const questions = ticketQuestions[type];


    if(!questions){


        return interaction.reply({


            content:

            "❌ Categoria ticket non valida.",


            ephemeral:true


        });


    }



    const modal = new ModalBuilder()


    .setCustomId(

        `ticket_modal_${type}`

    )


    .setTitle(

        "🎫 Informazioni Ticket"

    );




    questions.forEach((question,index)=>{


        const input = new TextInputBuilder()


        .setCustomId(

            `answer_${index}`

        )


        .setLabel(

            question.substring(0,45)

        )


        .setStyle(

            TextInputStyle.Paragraph

        )


        .setRequired(true);




        modal.addComponents(


            new ActionRowBuilder()

            .addComponents(input)


        );


    });




    await interaction.showModal(modal);


},

    // =====================================
// MODAL HANDLER
// =====================================

async modalHandler(interaction){


    const type = interaction.customId.replace(
        "ticket_modal_",
        ""
    );


    if(!ticketQuestions[type]){


        return interaction.reply({

            content:

            "❌ Categoria ticket non valida.",

            ephemeral:true

        });

    }



    const answers = [];


    for(let i = 0; i < 3; i++){


        answers.push(

            interaction.fields.getTextInputValue(
                `answer_${i}`
            )

        );

    }



    const alreadyOpen = [...tickets.values()]

    .some(ticket =>

        ticket.owner === interaction.user.id

    );



    if(alreadyOpen){


        return interaction.reply({

            content:

            "❌ Hai già un ticket aperto.",

            ephemeral:true

        });

    }



    await interaction.deferReply({

        ephemeral:true

    });



    const username = interaction.user.username

    .toLowerCase()

    .replace(/[^a-z0-9]/g,"-")

    .slice(0,20);



    let channel;



    try{


        channel = await interaction.guild.channels.create({


            name:

            `🎫・${type}-${username}`,


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


    }catch(error){


        console.error(

            "Errore creazione ticket:",

            error

        );



        return interaction.editReply({

            content:

            "❌ Errore durante la creazione del ticket."

        });

    }




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



    ticketPriority.set(

        channel.id,

        "🟢 Basso"

    );




    const embed = createEmbed(

        "🎫 Ticket Aperto",

`

👤 Utente:

${interaction.user}


📂 Categoria:

${type}


📌 Priorità:

🟢 Basso


━━━━━━━━━━━━━━


Lo Staff risponderà appena possibile.

`,

        "Green"

    );




    await channel.send({


        content:

        `${interaction.user} ${TICKET_STAFF_ROLES.map(role => `<@&${role}>`).join(" ")}`,


        embeds:[

            embed

        ]


    });



    const logs = interaction.guild.channels.cache.get(

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
// BUTTON HANDLER
// =====================================

async buttonHandler(interaction){


    const ticket = tickets.get(

        interaction.channel.id

    );



    if(!ticket){


        return interaction.reply({


            content:

            "❌ Questo ticket non è registrato nel sistema.",


            ephemeral:true


        });


    }



    // =====================================
    // CLAIM TICKET
    // =====================================


    if(interaction.customId === "ticket_claim"){



        if(!isStaff(interaction.member)){


            return interaction.reply({


                content:

                "❌ Non hai i permessi necessari per prendere in gestione un ticket.",


                ephemeral:true


            });


        }



        if(ticket.claimedBy){


            return interaction.reply({


                content:

                `⚠️ Questo ticket è già assegnato a <@${ticket.claimedBy}>.`,


                ephemeral:true


            });


        }



        // Salvataggio Staff assegnato


        ticket.claimedBy = interaction.user.id;



        tickets.set(

            interaction.channel.id,

            ticket

        );



        claimedTickets.set(

            interaction.channel.id,

            interaction.user.id

        );




        await interaction.reply({


            embeds:[


                createEmbed(

                    "🎯 Ticket Preso in Carico",

`

👤 **Staff assegnato:**

${interaction.user}


🎫 **Ticket:**

${interaction.channel}


━━━━━━━━━━━━━━━━━━


Il ticket è ora sotto gestione dello Staff.

La richiesta verrà analizzata e riceverai assistenza appena possibile.

`,

                    "Blue"

                )

            ]


        });




        // =====================================
        // LOG CLAIM
        // =====================================


        const logs = interaction.guild.channels.cache.get(

            LOG_CHANNEL_ID

        );



        if(logs){


            await logs.send({


                embeds:[


                    createEmbed(

                        "🎯 Ticket Assegnato",

`

👤 **Utente:**

<@${ticket.owner}>


🛡️ **Staff responsabile:**

${interaction.user}


📂 **Categoria:**

${ticket.type}


📍 **Canale:**

${interaction.channel}


━━━━━━━━━━━━━━━━━━

Ticket preso in gestione.

`

                    )

                ]

            });


        }


    }


}

    // =====================================
// BUTTON HANDLER
// =====================================

async buttonHandler(interaction){

    const ticket = tickets.get(
        interaction.channel.id
    );


    if(!ticket){

        return interaction.reply({

            content:
            "❌ Questo ticket non è registrato nel sistema.",

            ephemeral:true

        });

    }



    // =====================================
    // CLAIM TICKET
    // =====================================


    if(interaction.customId === "ticket_claim"){


        if(!isStaff(interaction.member)){


            return interaction.reply({

                content:
                "❌ Non hai i permessi necessari per prendere in gestione un ticket.",

                ephemeral:true

            });

        }



        if(ticket.claimedBy){


            return interaction.reply({

                content:
                `⚠️ Questo ticket è già assegnato a <@${ticket.claimedBy}>.`,

                ephemeral:true

            });

        }



        ticket.claimedBy = interaction.user.id;


        tickets.set(
            interaction.channel.id,
            ticket
        );


        claimedTickets.set(
            interaction.channel.id,
            interaction.user.id
        );



        await interaction.reply({

            embeds:[

                createEmbed(

                    "🎯 Ticket Preso in Carico",

`
👤 **Staff assegnato:**

${interaction.user}


🎫 **Ticket:**

${interaction.channel}


━━━━━━━━━━━━━━━━━━


Il ticket è ora sotto gestione dello Staff.

La richiesta verrà analizzata e riceverai assistenza appena possibile.
`,

                    0x3498DB

                )

            ]

        });



        const logs = interaction.guild.channels.cache.get(
            LOG_CHANNEL_ID
        );


        if(logs){


            await logs.send({

                embeds:[

                    createEmbed(

                        "🎯 Ticket Assegnato",

`
👤 **Utente:**

<@${ticket.owner}>


🛡️ **Staff responsabile:**

${interaction.user}


📂 **Categoria:**

${ticket.type}


📍 **Canale:**

${interaction.channel}


━━━━━━━━━━━━━━━━━━

Ticket preso in gestione.
`

                    )

                ]

            });

        }


        return;

    }



    // =====================================
    // PRIORITY TICKET
    // =====================================


    if(interaction.customId === "ticket_priority"){


        if(!isStaff(interaction.member)){


            return interaction.reply({

                content:
                "❌ Solo lo Staff può modificare la priorità del ticket.",

                ephemeral:true

            });

        }



        const oldPriority = ticketPriority.get(
            interaction.channel.id
        ) || "🟢 Basso";



        let newPriority;


        switch(oldPriority){


            case "🟢 Basso":

                newPriority = "🟡 Media";

            break;



            case "🟡 Media":

                newPriority = "🔴 Alta";

            break;



            default:

                newPriority = "🟢 Basso";

            break;


        }



        ticketPriority.set(

            interaction.channel.id,

            newPriority

        );



        await interaction.reply({

            embeds:[

                createEmbed(

                    "📌 Priorità Aggiornata",

`
🎫 **Ticket**

${interaction.channel}


━━━━━━━━━━━━━━━━━━


🔽 **Prima**

${oldPriority}


🔼 **Dopo**

${newPriority}


🛡️ **Modificata da**

${interaction.user}


━━━━━━━━━━━━━━━━━━


Sistema Ticket Elegance.
`,

                    0xF1C40F

                )

            ]

        });



        const logs = interaction.guild.channels.cache.get(
            LOG_CHANNEL_ID
        );


        if(logs){


            await logs.send({

                embeds:[

                    createEmbed(

                        "📌 Cambio Priorità Ticket",

`
👤 **Utente**

<@${ticket.owner}>


🎫 **Ticket**

${interaction.channel}


━━━━━━━━━━━━━━━━━━


🔽 Prima:

${oldPriority}


🔼 Dopo:

${newPriority}


🛡️ Staff:

${interaction.user}
`

                    )

                ]

            });

        }


        return;

    }

           // =====================================
    // CLOSE TICKET
    // =====================================


    if(interaction.customId === "ticket_close"){


        if(

            interaction.user.id !== ticket.owner

            &&

            !isStaff(interaction.member)

        ){


            return interaction.reply({

                content:

                "❌ Non hai il permesso di chiudere questo ticket.",

                ephemeral:true

            });

        }



        await interaction.reply({

            embeds:[

                createEmbed(

                    "🔒 Ticket Chiuso",

`
🎫 **Ticket**

${interaction.channel}


👤 **Chiuso da**

${interaction.user}


📂 **Categoria**

${ticket.type}


━━━━━━━━━━━━━━━━━━


🗑️ Il ticket verrà eliminato automaticamente tra **5 secondi**.


Grazie per aver utilizzato il supporto Elegance.
`,

                    0xE74C3C

                )

            ]

        });



        const logs = interaction.guild.channels.cache.get(
            LOG_CHANNEL_ID
        );


        if(logs){


            await logs.send({

                embeds:[

                    createEmbed(

                        "🔒 Ticket Eliminato",

`
👤 **Proprietario**

<@${ticket.owner}>


🛡️ **Chiuso da**

${interaction.user}


📂 **Categoria**

${ticket.type}


📍 **Canale**

${interaction.channel}


━━━━━━━━━━━━━━━━━━


Ticket rimosso dal sistema.
`,

                        0xE74C3C

                    )

                ]

            });

        }



        setTimeout(async()=>{


            tickets.delete(
                interaction.channel.id
            );


            claimedTickets.delete(
                interaction.channel.id
            );


            ticketPriority.delete(
                interaction.channel.id
            );



            if(interaction.channel){


                await interaction.channel.delete()

                .catch(console.error);


            }


        },5000);



        return;

    }


                }
