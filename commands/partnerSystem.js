const { EmbedBuilder } = require("discord.js");


async function sendPartnership(interaction, type, emoji) {

    const descrizione = interaction.options.getString("descrizione");

    const ping = interaction.options.getRole("ping");

    const manager = interaction.options.getUser("manager");

    const data = interaction.options.getString("data");


    const mainMessage = descrizione;



    let infoMessage =
`————————${emoji}————————

Autore:
${interaction.user}

`;


    if (manager) {

        infoMessage +=
`Manager:
${manager}

`;

    }



    if (ping) {

        infoMessage +=
`Ping:
${ping}

`;

    }



    if (data) {

        infoMessage +=
`Data:
${data}

`;

    }



    const channel = interaction.channel;



    await interaction.reply({
        content: "✅ Messaggio inviato.",
        ephemeral: true
    });



    await channel.send({
        content: mainMessage
    });



    await channel.send({
        content: infoMessage
    });

}


module.exports = {
    sendPartnership
};
