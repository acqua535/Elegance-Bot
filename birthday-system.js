const {
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");


const USERS_FILE =
path.join(
    __dirname,
    "users.json"
);


const BIRTHDAY_CHANNEL =
"1526083630760460388";


// Memoria per evitare doppioni

let sentToday = [];



module.exports = (client) => {


    console.log(
        "🎂 Birthday System caricato."
    );


    setInterval(
        async () => {


            const now =
            new Date();


            const day =
            now.getDate();


            const month =
            now.getMonth() + 1;



            if(!fs.existsSync(USERS_FILE))
                return;



            const users =
            JSON.parse(
                fs.readFileSync(
                    USERS_FILE,
                    "utf8"
                )
            );



            for(const userData of users){



                if(!userData.birthday)
                    continue;



                const birthday =
                userData.birthday.split("/");



                const birthdayDay =
                Number(birthday[0]);


                const birthdayMonth =
                Number(birthday[1]);



                if(
                    birthdayDay === day &&
                    birthdayMonth === month
                ){



                    if(
                        sentToday.includes(
                            userData.id
                        )
                    )
                    continue;



                    const channel =
                    client.channels.cache.get(
                        BIRTHDAY_CHANNEL
                    );



                    if(!channel)
                        continue;



                    const member =
                    await channel.guild.members
                    .fetch(userData.id)
                    .catch(
                        () => null
                    );



                    if(!member)
                        continue;



                    const embed =
                    new EmbedBuilder()

                    .setTitle(
                        "🎂 AUGURI!"
                    )

                    .setDescription(

`Oggi è il compleanno di ${member}! 🎉

⚜️ Tutta **Elegance Sponsoring** ti augura un fantastico compleanno!`

                    )

                    .setFooter({

                        text:
                        "⚜️ Elegance Birthday System"

                    })

                    .setTimestamp();



                    await channel.send({

                        embeds:[
                            embed
                        ]

                    });



                    sentToday.push(
                        userData.id
                    );



                }


            }



            // reset ogni giorno

            if(
                now.getHours() === 0 &&
                now.getMinutes() === 0
            ){

                sentToday = [];

            }



        },

        60000

    );


};
