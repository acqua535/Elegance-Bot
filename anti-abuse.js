const {
    EmbedBuilder,
    AuditLogEvent
} = require("discord.js");


const REPORT_CHANNEL_ID = "1514016377546215624";


const LIMIT = 5;
const TIME = 60000;


const actions = new Map();



module.exports = (client) => {



    client.on(
        "guildBanAdd",
        async (ban) => {


            try {


                const logs =
                    await ban.guild.fetchAuditLogs({

                        type: AuditLogEvent.MemberBanAdd,

                        limit: 1

                    });


                const entry =
                    logs.entries.first();



                if (!entry)
                    return;



                const staff =
                    entry.executor;



                if (!staff)
                    return;



                checkAbuse(

                    ban.guild,

                    staff,

                    "BAN"

                );


            } catch(error) {


                console.error(
                    "Anti-Abuse BAN:",
                    error
                );


            }


        }
    );





    client.on(
        "guildMemberRemove",
        async (member) => {


            try {


                const logs =
                    await member.guild.fetchAuditLogs({

                        type: AuditLogEvent.MemberKick,

                        limit: 1

                    });


                const entry =
                    logs.entries.first();



                if (!entry)
                    return;



                const staff =
                    entry.executor;



                if (!staff)
                    return;



                checkAbuse(

                    member.guild,

                    staff,

                    "KICK"

                );


            } catch(error) {


                console.error(
                    "Anti-Abuse KICK:",
                    error
                );


            }


        }
    );



};



async function checkAbuse(
    guild,
    staff,
    action
) {



    const key =
        `${guild.id}-${staff.id}-${action}`;



    if (!actions.has(key)) {

        actions.set(
            key,
            []
        );

    }



    const now =
        Date.now();



    const history =
        actions.get(key);



    history.push(now);



    const recent =
        history.filter(

            time =>
            now - time < TIME

        );



    actions.set(
        key,
        recent
    );



    if (
        recent.length >= LIMIT
    ) {



        const channel =
            guild.channels.cache.get(
                REPORT_CHANNEL_ID
            );



        if (!channel)
            return;



        const embed =
            new EmbedBuilder()

            .setTitle(
                "🚨 Anti-Abuse Alert"
            )

            .setDescription(
                "Possibile abuso staff rilevato."
            )

            .addFields(

                {
                    name:"👤 Staff",
                    value:`${staff}`,
                    inline:true
                },

                {
                    name:"⚠️ Azione",
                    value:action,
                    inline:true
                },

                {
                    name:"📊 Quantità",
                    value:`${recent.length} azioni in 60 secondi`
                }

            )

            .setFooter({

                text:
                "⚜️ Elegance Sponsoring • Security System"

            })

            .setTimestamp();



        await channel.send({

            embeds:[
                embed
            ]

        });



        actions.set(
            key,
            []
        );


    }


}
