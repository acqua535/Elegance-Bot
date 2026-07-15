const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");


// ===============================
// CONFIG
// ===============================

const LOG_CHANNEL_ID = "1505261606483923105";
const TICKET_CATEGORY_ID = "1525919850764177408";

const TICKET_STAFF_ROLES = [
    "1505192718068879430",
    "1505192964769714287"
];


// ===============================
// STORAGE
// ===============================

const tickets = new Map();
const claimed = new Map();
const priorities = new Map();


// ===============================
// EMBED SYSTEM
// ===============================

function embed(title, description, color = "Gold") {

    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();

}


// ===============================
// QUESTIONS
// ===============================

const questions = {

    partner: [
        "Nome del progetto/server?",
        "Che collaborazione proponi?",
        "Perché dovremmo collaborare?"
    ],

    staff: [
        "Che esperienza hai nello staff?",
        "Perché vuoi entrare?",
        "Quanto tempo puoi dedicare?"
    ],

    bug: [
        "Descrivi il problema.",
        "Quando succede?",
        "Hai prove o screenshot?"
    ],

    idea: [
        "Qual è la tua idea?",
        "Come migliorerebbe il server?",
        "Altri dettagli?"
    ]

};


// ===============================
// COMMAND
// ===============================

module.exports = {


data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Apri un ticket di supporto"),



async execute(interaction) {


    const menu = new StringSelectMenuBuilder()

        .setCustomId("ticket_category")

        .setPlaceholder("Seleziona categoria")

        .addOptions([

            {
                label:"Supporto Partner",
                value:"partner",
                emoji:"🤝"
            },

            {
                label:"Bando Staff",
                value:"staff",
                emoji:"🛡️"
            },

            {
                label:"Segnalazione Bug",
                value:"bug",
                emoji:"🐞"
            },

            {
                label:"Idea",
                value:"idea",
                emoji:"💡"
            }

        ]);


    await interaction.reply({

        embeds:[

            embed(
                "🎫 Elegance Support",
                "Seleziona il tipo di richiesta."
            )

        ],

        components:[

            new ActionRowBuilder()
            .addComponents(menu)

        ]

    });


},

    // ===============================
// CATEGORY HANDLER
// ===============================

async categoryHandler(interaction) {


    await interaction.deferReply({
        ephemeral:true
    });


    const type = interaction.values[0];


    const channelName = {

        partner:"supporto-partner",
        staff:"bando-staff",
        bug:"segnalazione-bug",
        idea:"idee"

    };



    const channel = await interaction.guild.channels.create({

        name:`🎫・${channelName[type]}-${interaction.user.username}`,

        type:ChannelType.GuildText,

        parent:TICKET_CATEGORY_ID,


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



    priorities.set(
        channel.id,
        "🟢 Basso"
    );



    tickets.set(

        channel.id,

        {

            owner:interaction.user.id,

            type:type,

            created:Date.now()

        }

    );




    const management = new StringSelectMenuBuilder()

        .setCustomId("ticket_manage")

        .setPlaceholder("🎫 Gestione Ticket")

        .addOptions([


            {
                label:"Reclama",
                value:"claim",
                emoji:"👤"
            },


            {
                label:"Cambia priorità",
                value:"priority",
                emoji:"📌"
            },


            {
                label:"Aggiungi membro",
                value:"add",
                emoji:"👥"
            },


            {
                label:"Rimuovi membro",
                value:"remove",
                emoji:"🚫"
            },


            {
                label:"Cambia nome",
                value:"rename",
                emoji:"✏️"
            },


            {
                label:"Transcript",
                value:"transcript",
                emoji:"📋"
            },


            {
                label:"Informazioni",
                value:"info",
                emoji:"📊"
            },


            {
                label:"Chiudi",
                value:"close",
                emoji:"🔒"
            }


        ]);




    const ticketEmbed = embed(

        "🎫 Ticket Aperto",

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
        `,

        "Green"

    );




    await channel.send({

        content:

        `${interaction.user} ${TICKET_STAFF_ROLES.map(r=>`<@&${r}>`).join(" ")}`,

        embeds:[ticketEmbed],

        components:[

            new ActionRowBuilder()
            .addComponents(management)

        ]

    });




    const log = interaction.guild.channels.cache.get(
        LOG_CHANNEL_ID
    );


    if(log){

        log.send({

            embeds:[

                embed(

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

        content:`✅ Ticket creato: ${channel}`

    });


},

        // ===============================
// MENU HANDLER
// ===============================

async menuHandler(interaction) {


    const value = interaction.values[0];



    // ===========================
    // CLAIM
    // ===========================


    if(value === "claim"){


        const allowed = TICKET_STAFF_ROLES.some(

            role => interaction.member.roles.cache.has(role)

        );


        if(!allowed){

            return interaction.reply({

                content:"❌ Non puoi reclamare ticket.",

                ephemeral:true

            });

        }



        claimed.set(

            interaction.channel.id,

            interaction.user.id

        );



        return interaction.reply({

            embeds:[

                embed(

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





    // ===========================
    // PRIORITY MENU
    // ===========================


    if(value === "priority"){


        const menu = new StringSelectMenuBuilder()

        .setCustomId("ticket_priority")

        .setPlaceholder("📌 Seleziona priorità")

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





    // ===========================
    // INFO
    // ===========================


    if(value === "info"){


        const data = tickets.get(

            interaction.channel.id

        );



        return interaction.reply({

            embeds:[

                embed(

                    "📊 Informazioni Ticket",

                    `
👤 Proprietario:
<@${data?.owner}>

📂 Categoria:
${data?.type}

📌 Priorità:
${priorities.get(interaction.channel.id)}

🕒 Creato:
<t:${Math.floor(data.created / 1000)}:R>
                    `

                )

            ],

            ephemeral:true

        });


    }





    // ===========================
    // RENAME
    // ===========================


    if(value === "rename"){


        return interaction.reply({

            content:

            "✏️ Scrivi il nuovo nome del ticket.",

            ephemeral:true

        });


    }





    // ===========================
    // CLOSE
    // ===========================


    if(value === "close"){


        return this.closeTicket(

            interaction

        );


    }


},

    // ===============================
// PRIORITY HANDLER
// ===============================

async priorityHandler(interaction){


    const value = interaction.values[0];


    let name;
    let color;



    switch(value){


        case "low":

            name = "🟢 Basso";
            color = "Green";

        break;



        case "medium":

            name = "🟠 Medio";
            color = "Orange";

        break;



        case "high":

            name = "🔴 Alto";
            color = "Red";

        break;


    }



    priorities.set(

        interaction.channel.id,

        name

    );



    const messages = await interaction.channel.messages.fetch({

        limit:10

    });



    const ticketMessage = messages.find(

        msg =>

        msg.author.id === interaction.client.user.id &&

        msg.embeds.length

    );



    if(ticketMessage){


        const old = ticketMessage.embeds[0];



        const updated = EmbedBuilder.from(old)

        .setColor(color)

        .setDescription(

            old.description.replace(

                /📌 Priorità:\n.*/,

                `📌 Priorità:\n${name}`

            )

        );



        await ticketMessage.edit({

            embeds:[updated]

        });


    }



    await interaction.reply({

        content:`✅ Priorità aggiornata: ${name}`,

        ephemeral:true

    });


},






// ===============================
// ADD MEMBER
// ===============================

async addMemberHandler(interaction){



    await interaction.reply({

        content:"👥 Menziona l'utente da aggiungere.",

        ephemeral:true

    });



    const collector = interaction.channel.createMessageCollector({

        filter:

        m => m.author.id === interaction.user.id,

        max:1,

        time:30000

    });



    collector.on("collect", async msg => {



        const member = msg.mentions.members.first();



        if(!member){

            return msg.reply(

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



        msg.reply(

            `✅ ${member} aggiunto al ticket.`

        );


    });


},






// ===============================
// REMOVE MEMBER
// ===============================

async removeMemberHandler(interaction){


    await interaction.reply({

        content:"🚫 Menziona l'utente da rimuovere.",

        ephemeral:true

    });



    const collector = interaction.channel.createMessageCollector({

        filter:

        m => m.author.id === interaction.user.id,

        max:1,

        time:30000

    });



    collector.on("collect", async msg => {



        const member = msg.mentions.members.first();



        if(!member){

            return msg.reply(

                "❌ Utente non trovato."

            );

        }



        await interaction.channel.permissionOverwrites.delete(

            member.id

        );



        msg.reply(

            `✅ ${member} rimosso dal ticket.`

        );


    });


},






// ===============================
// TRANSCRIPT
// ===============================

async transcriptHandler(interaction){


    const messages = await interaction.channel.messages.fetch({

        limit:100

    });



    let text = "";



    messages.reverse().forEach(msg=>{


        text +=

        `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;


    });



    const file = new AttachmentBuilder(

        Buffer.from(text),

        {

            name:`transcript-${interaction.channel.name}.txt`

        }

    );



    await interaction.reply({

        content:"📋 Transcript creato.",

        files:[file],

        ephemeral:true

    });


},

    // ===============================
// CLOSE TICKET
// ===============================

async closeTicket(interaction){


    const data = tickets.get(

        interaction.channel.id

    );


    const staff = claimed.get(

        interaction.channel.id

    );



    const messages = await interaction.channel.messages.fetch({

        limit:100

    });



    let transcript = "";



    messages.reverse().forEach(msg=>{


        transcript +=

        `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;


    });



    const file = new AttachmentBuilder(

        Buffer.from(transcript),

        {

            name:`ticket-${interaction.channel.name}.txt`

        }

    );




    const logs = interaction.guild.channels.cache.get(

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

            files:[file]

        });


    }





    // ===========================
    // DM VALUTAZIONE
    // ===========================


    try{


        const user = await interaction.client.users.fetch(

            data.owner

        );



        await user.send({

            embeds:[

                embed(

                    "⭐ Valuta la tua assistenza",

                    `
Il tuo ticket è stato chiuso.

Grazie per aver contattato Elegance Support.

━━━━━━━━━━━━━━

👨‍💼 Staff:

${staff ? `<@${staff}>` : "Non assegnato"}


📂 Categoria:

${data.type}


Come valuti l'assistenza?

Invia un voto da ⭐ 1 a ⭐ 5.

Dopo il voto puoi scrivere una descrizione.

━━━━━━━━━━━━━━

Firma automatica:

⚜️ Elegance Support System

                    `,

                    "Gold"

                )

            ]

        });


    }catch(e){}





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






// ===============================
// ROUTER
// ===============================

async router(interaction){



    if(interaction.isStringSelectMenu()){



        if(interaction.customId === "ticket_manage"){


            return this.menuHandler(

                interaction

            );


        }




        if(interaction.customId === "ticket_priority"){


            return this.priorityHandler(

                interaction

            );


        }


    }



},






// ===============================
// EXPORT
// ===============================

};
