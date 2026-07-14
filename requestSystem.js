const {
    EmbedBuilder
} = require("discord.js");


async function createRequest(interaction, type) {


    const link =
    interaction.options.getString("link");


    const autore =
    interaction.options.getUser("autore");


    const category =
    interaction.options.getString("category");



    let invite;


    try {


        invite =
        await interaction.client.fetchInvite(link);


    } catch(error){


        return interaction.reply({

            content:
            "❌ Link Discord non valido.",

            ephemeral:true

        });


    }



    const guild =
    invite.guild;



    const description =
    guild.description ||
    "Nessuna descrizione disponibile.";



    const embed =
    new EmbedBuilder()

    .setTitle(
        type
    )


    .setDescription(

`
━━━━━━━━━━━━━━

👤 **Autore**

${autore}


📨 **Richiesta da**

${interaction.user}


🏷️ **Categoria**

${category}


━━━━━━━━━━━━━━

📝 **Descrizione**

${description}

━━━━━━━━━━━━━━

⚜️ Elegance Sponsoring

`

    )


    .setColor("Gold")

    .setTimestamp();



    // QUI METTEREMO IL CANALE FISSO


    await interaction.reply({

        content:
        "✅ Richiesta inviata.",

        ephemeral:true

    });



    const channel =
    interaction.channel;



    await channel.send({

        embeds:[
            embed
        ]

    });



    return embed;


}



module.exports = {

    createRequest

};
