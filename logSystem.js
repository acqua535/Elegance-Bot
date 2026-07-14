const {
    EmbedBuilder
} = require("discord.js");


const LOG_CHANNEL_ID =
"1505261606483923105";



async function sendLog(guild, options = {}) {


    try {


        if(!guild)
        return;



        const channel =
        guild.channels.cache.get(
            LOG_CHANNEL_ID
        );



        if(!channel)
        return;



        const embed =
        new EmbedBuilder()

        .setTitle(
            options.title ||
            "⚜️ Elegance Log"
        )


        .setColor(
            options.color ||
            "Blue"
        )


        .addFields(

            {
                name:
                "👤 Utente",

                value:
                options.user
                ?
                `${options.user}`
                :
                "N/D"
            },


            {
                name:
                "⚙️ Azione",

                value:
                options.action ||
                "N/D"
            },


            {
                name:
                "📍 Canale",

                value:
                options.channel
                ?
                `${options.channel}`
                :
                "N/D"
            }

        )


        .setTimestamp()


        .setFooter({

            text:
            "⚜️ Elegance Sponsoring Logs"

        });



        if(options.details){


            embed.addFields({

                name:
                "📝 Dettagli",

                value:
                options.details

            });


        }



        await channel.send({

            embeds:[
                embed
            ]

        });



    }

    catch(error){


        console.error(
            "❌ Log System Error:",
            error
        );


    }


}




module.exports = {

    sendLog

};
