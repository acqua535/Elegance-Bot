const fs = require("fs");
const { EmbedBuilder } = require("discord.js");


const file = "./ticketsData.json";



const TICKET_CATEGORY_ID = "1525919850764177408";





function loadData() {


    if(!fs.existsSync(file)) {


        fs.writeFileSync(
            file,
            "{}"
        );


    }



    return JSON.parse(

        fs.readFileSync(
            file,
            "utf8"
        )

    );


}






function saveData(data) {


    fs.writeFileSync(

        file,

        JSON.stringify(
            data,
            null,
            4
        )

    );


}








function savePanel(guildId, channelId, messageId) {


    const data =
    loadData();



    data[guildId] = {


        panelChannel:
        channelId,


        panelMessage:
        messageId



    };



    saveData(data);


}









function getTicketStats(guild) {


    const tickets =

    guild.channels.cache.filter(

        channel =>

        channel.parentId === TICKET_CATEGORY_ID

    );




    return {


        partner:

        tickets.filter(

            c =>
            c.name.includes(
                "supporto-partner"
            )

        ).size,



        staff:

        tickets.filter(

            c =>
            c.name.includes(
                "bando-staff"
            )

        ).size,



        bug:

        tickets.filter(

            c =>
            c.name.includes(
                "segnalazione-bug"
            )

        ).size,



        idea:

        tickets.filter(

            c =>
            c.name.includes(
                "idee-suggerimenti"
            )

        ).size



    };


}









async function updatePanel(guild) {



    const data =
    loadData();



    const panelData =
    data[guild.id];



    if(!panelData)
    return;



    const channel =

    guild.channels.cache.get(

        panelData.panelChannel

    );



    if(!channel)
    return;





    const message =

    await channel.messages.fetch(

        panelData.panelMessage

    )

    .catch(() => null);




    if(!message)
    return;







    const stats =

    getTicketStats(guild);







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







    await message.edit({

        embeds:[

            embed

        ]

    })

    .catch(() => {});



}








module.exports = {


    getTicketStats,


    savePanel,


    updatePanel



};
