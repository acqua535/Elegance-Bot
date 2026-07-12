const { EmbedBuilder } = require("discord.js");


const LOG_CHANNEL_ID = "1505261606483923105";


const ALLOWED_ROLES = [
    "1505192718068879430",
    "1505192964769714287"
];



async function sendPartnership(
    interaction,
    channelId,
    title,
    emoji,
    color
) {


    const hasPermission = interaction.member.roles.cache.some(
        role => ALLOWED_ROLES.includes(role.id)
    );


    if (!hasPermission) {

        return interaction.reply({

            content: "❌ Non hai il permesso di usare questo comando.",

            ephemeral: true

        });

    }



    const descrizione =
        interaction.options.getString("descrizione");


    const ping =
        interaction.options.getRole("ping");


    const manager =
        interaction.options.getUser("manager");


    const data =
        interaction.options.getString("data");



    const channel =
        interaction.guild.channels.cache.get(channelId);



    if (!channel) {

        return interaction.reply({

            content: "❌ Canale destinazione non trovato.",

            ephemeral: true

        });

    }



    let info =
`————————${emoji}————————

Autore:
${interaction.user}

`;



    if (manager) {

        info +=
`Manager:
${manager}

`;

    }



    if (ping) {

        info +=
`Ping:
${ping}

`;

    }



    if (data) {

        info +=
`Data:
${data}

`;

    }



    await interaction.reply({

        content: "✅ Messaggio pubblicato.",

        ephemeral: true

    });



    await channel.send({

        content: descrizione

    });



    await channel.send({

        content: info

    });




    const logs =
        interaction.guild.channels.cache.get(LOG_CHANNEL_ID);



    if (logs) {


        const logEmbed = new EmbedBuilder()

            .setTitle(`${emoji} ${title} Creato`)

            .setDescription(

`👤 **Autore**
${interaction.user}

${manager ? `👔 **Manager**
${manager}

` : ""}${ping ? `🔔 **Ping**
${ping}

` : ""}${data ? `📅 **Data**
${data}` : ""}`

            )

            .setColor(color)

            .setTimestamp();



        logs.send({

            embeds: [logEmbed]

        });


    }


}



module.exports = {
    sendPartnership
};
