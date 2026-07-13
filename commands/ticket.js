const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits,
    AttachmentBuilder
} = require("discord.js");


const fs = require("fs");


const ticketsSystem = require("../ticketsSystem");



const LOG_CHANNEL_ID =
"1505261606483923105";


const TICKET_CATEGORY_ID =
"1525919850764177408";



const TICKET_STAFF_ROLES = [

    "1505192718068879430",
    "1505192964769714287"

];





async function createTranscript(channel) {


    const messages =
    await channel.messages.fetch({
        limit: 100
    });



    let transcript = "";



    const sorted =
    messages.sort(
        (a,b) =>
        a.createdTimestamp -
        b.createdTimestamp
    );



    sorted.forEach(message => {


        transcript +=

        `[${new Date(message.createdTimestamp).toLocaleString()}] ${message.author.tag}: ${message.content}\n`;


    });



    const fileName =
    `transcript-${channel.name}.txt`;



    fs.writeFileSync(

        fileName,

        transcript ||
        "Nessun messaggio trovato."

    );



    return new AttachmentBuilder(
        fileName
    );

}






module.exports = {



data:

new SlashCommandBuilder()

.setName("ticket")

.setDescription(
    "Apri un ticket di supporto"
),







async execute(interaction) {



    const stats =
    ticketsSystem.getTicketStats(
        interaction.guild
    );




    const menu =

    new StringSelectMenuBuilder()

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







    const row =

    new ActionRowBuilder()

    .addComponents(
        menu
    );







    const embed =

    new EmbedBuilder()

    .setTitle(
        "🎫 Elegance Support"
    )

    .setDescription(

`
Seleziona la categoria del tuo ticket.

━━━━━━━━━━━━━━━━

📊 **Ticket Live**

🤝 Supporto Partner
${stats.partner > 0 ? "🔴" : "🟢"} ${stats.partner} aperti


🛡️ Bando Staff
${stats.staff > 0 ? "🔴" : "🟢"} ${stats.staff} aperti


🐞 Segnalazioni / Bug
${stats.bug > 0 ? "🔴" : "🟢"} ${stats.bug} aperti


💡 Idee / Suggerimenti
${stats.idea > 0 ? "🔴" : "🟢"} ${stats.idea} aperti


━━━━━━━━━━━━━━━━
`

    )

    .setTimestamp();






    const message =

    await interaction.reply({

        embeds:[
            embed
        ],

        components:[
            row
        ],

        fetchReply:true

    });





    ticketsSystem.savePanel(

        interaction.guild.id,

        interaction.channel.id,

        message.id

    );



},

    



async categoryHandler(interaction) {


    await interaction.deferReply({

        ephemeral:true

    });



    const type =
    interaction.values[0];



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






    const channel =

    await interaction.guild.channels.create({



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








    const buttons =


    new ActionRowBuilder()

    .addComponents(



        new ButtonBuilder()

        .setCustomId(
            "claim_ticket"
        )

        .setLabel(
            "🙋 Reclama"
        )

        .setStyle(
            ButtonStyle.Primary
        ),




        new ButtonBuilder()

        .setCustomId(
            "close_ticket"
        )

        .setLabel(
            "🔒 Chiudi"
        )

        .setStyle(
            ButtonStyle.Danger
        )


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
Lo Staff risponderà appena possibile.

Usa i bottoni qui sotto per gestire il ticket.
`

            )


            .setTimestamp()



        ],



        components:[

            buttons

        ]



    });







    const logs =

    interaction.guild.channels.cache.get(
        LOG_CHANNEL_ID
    );





    if(logs) {


        logs.send({


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
`

                )


                .setTimestamp()



            ]



        });



    }






    // AGGIORNAMENTO LIVE

    ticketsSystem.updatePanel(
        interaction.guild
    );







    await interaction.editReply({


        content:

        `✅ Ticket creato: ${channel}`


    });



},







async buttonHandler(interaction) {



    const logs =

    interaction.guild.channels.cache.get(
        LOG_CHANNEL_ID
    );






    if(interaction.customId === "claim_ticket") {



        await interaction.reply({


            content:

            `🙋 Ticket reclamato da ${interaction.user}`,


            ephemeral:false


        });




        if(logs) {


            logs.send({


                embeds:[


                    new EmbedBuilder()


                    .setTitle(
                        "🙋 Ticket Reclamato"
                    )


                    .setDescription(

`
👤 **Staff**

${interaction.user}


📌 **Canale**

${interaction.channel}
`

                    )


                    .setTimestamp()



                ]



            });


        }



    }








    if(interaction.customId === "close_ticket") {



        await interaction.reply({


            content:

            "🔒 Ticket chiuso. Creo il transcript...",


            ephemeral:false



        });






        const transcript =

        await createTranscript(
            interaction.channel
        );







        if(logs) {


            logs.send({


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
`

                    )


                    .setTimestamp()



                ],


                files:[

                    transcript

                ]



            });



        }







        ticketsSystem.updatePanel(
            interaction.guild
        );







        setTimeout(() => {


            interaction.channel.delete()

            .catch(() => {});



        },3000);




    }



}



};
