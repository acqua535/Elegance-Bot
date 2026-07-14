const { EmbedBuilder } = require("discord.js");

const LOG_CHANNEL_ID = "1505261606483923105";


async function sendLog(guild, data) {

    const channel =
        guild.channels.cache.get(LOG_CHANNEL_ID);


    if (!channel) return;


    const embed =
        new EmbedBuilder()

        .setTitle(
            data.title || "⚜️ Elegance Log"
        )

        .setDescription(
`
👤 **Utente**
${data.user || "N/D"}

📌 **Comando**
${data.command || "N/D"}

📍 **Canale**
${data.channel || "N/D"}

${data.details || ""}
`
        )

        .setColor(
            data.color || "Blue"
        )

        .setTimestamp()

        .setFooter({
            text:
            "⚜️ Elegance Sponsoring Logs"
        });


    await channel.send({
        embeds:[
            embed
        ]
    });


}


module.exports = {
    sendLog
};
