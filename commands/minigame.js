const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


let activeGame = false;
let lastGame = null;


const questions = [
    {
        question: "Qual è il pianeta più grande del Sistema Solare?",
        answer: "giove"
    },
    {
        question: "Quanto fa 5 + 7?",
        answer: "12"
    },
    {
        question: "Qual è la capitale d'Italia?",
        answer: "roma"
    }
];


const games = [
    "number",
    "quiz",
    "coin",
    "dice",
    "rps"
];



module.exports = {


    data: new SlashCommandBuilder()

        .setName("minigame")

        .setDescription("Avvia un minigame casuale"),



    async execute(interaction) {


        if (activeGame) {

            return interaction.reply({

                content:
                "⚠️ Un minigame è già in corso!",

                ephemeral: true

            });

        }


        activeGame = true;



        let game;


        do {

            game =
                games[
                    Math.floor(
                        Math.random() * games.length
                    )
                ];

        } while (game === lastGame);


        lastGame = game;



        const names = {

            number:
            "🎯 Indovina il Numero",

            quiz:
            "🧠 Quiz",

            coin:
            "🪙 Testa o Croce",

            dice:
            "🎲 Dado",

            rps:
            "✊ Sasso Carta Forbice"

        };



        await interaction.reply({

            embeds: [

                new EmbedBuilder()

                .setTitle(
                    `🎮 ${names[game]}`
                )

                .setDescription(
                    "Preparazione del minigame..."
                )

            ]

        });



        await wait(3000);



        for (let i = 7; i >= 1; i--) {


            await interaction.editReply({

                embeds: [

                    new EmbedBuilder()

                    .setTitle(
                        i === 7
                        ? "🌌 Il minigame sta prendendo forma..."
                        : "🔥 Preparazione..."
                    )

                    .setDescription(
`
La scelta sta per essere svelata...

⏳ ${i}
`
                    )

                ]

            });


            await wait(1000);

        }



        await interaction.editReply({

            embeds: [

                new EmbedBuilder()

                .setTitle(
                    "🎮 Minigame iniziato!"
                )

                .setDescription(
                    "La sfida è partita! 🍀"
                )

            ]

        });



        try {


            if (game === "number")
                await numberGame(interaction);


            if (game === "quiz")
                await quizGame(interaction);


            if (game === "coin")
                await coinGame(interaction);


            if (game === "dice")
                await diceGame(interaction);


            if (game === "rps")
                await rpsGame(interaction);



        } catch(error) {

            console.error(error);

        }



        activeGame = false;


    }

};





async function numberGame(interaction) {


    const number =
        Math.floor(Math.random() * 10) + 1;



    await interaction.channel.send(
`
🎯 **Indovina il numero!**

Sto pensando a un numero da **1 a 10**.

Hai 20 secondi!
`
    );



    const msg =
        await collectMessage(interaction,20);



    if (!msg) {

        return interaction.channel.send(
            "⏰ Tempo scaduto!"
        );

    }



    if (
        msg.content === String(number)
    ) {

        return interaction.channel.send(
            `🏆 ${msg.author} ha indovinato! Era **${number}**`
        );

    }


    interaction.channel.send(
        `❌ Nessuno ha indovinato. Era **${number}**`
    );


}





async function quizGame(interaction) {


    const q =
        questions[
            Math.floor(
                Math.random()*questions.length
            )
        ];



    await interaction.channel.send(
`
🧠 **QUIZ**

${q.question}

⏳ Hai 20 secondi!
`
    );



    const msg =
        await collectMessage(interaction,20);



    if (!msg)
        return interaction.channel.send(
            "⏰ Tempo scaduto!"
        );



    if (
        msg.content.toLowerCase()
        === q.answer
    ) {

        interaction.channel.send(
            `🏆 ${msg.author} ha risposto correttamente!`
        );

    } else {

        interaction.channel.send(
            `❌ Risposta errata! La risposta era **${q.answer}**`
        );

    }


}





async function coinGame(interaction) {


    const row =
        new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
            .setCustomId("testa")
            .setLabel("Testa")
            .setStyle(ButtonStyle.Primary),


            new ButtonBuilder()
            .setCustomId("croce")
            .setLabel("Croce")
            .setStyle(ButtonStyle.Secondary)

        );



    const msg =
        await interaction.channel.send({

            content:
            "🪙 Scegli il risultato!",

            components:[row]

        });



    const result =
        Math.random() > 0.5
        ? "testa"
        : "croce";



    const btn =
        await msg.awaitMessageComponent({

            time:20000

        }).catch(()=>null);



    if (!btn)
        return msg.edit({
            content:"⏰ Tempo scaduto!",
            components:[]
        });



    await btn.update({

        content:
        btn.customId === result
        ? `🏆 Hai vinto! Era ${result}`
        : `❌ Hai perso! Era ${result}`,

        components:[]

    });


}





async function diceGame(interaction){


    const roll =
        Math.floor(Math.random()*6)+1;



    interaction.channel.send(
`
🎲 Il dado è stato lanciato!

Indovina il numero da 1 a 6.
`
    );


    const msg =
        await collectMessage(interaction,20);



    if(msg?.content === String(roll)){

        interaction.channel.send(
            `🏆 ${msg.author} ha vinto!`
        );

    } else {

        interaction.channel.send(
            `❌ Era ${roll}`
        );

    }

}





async function rpsGame(interaction){

    interaction.channel.send(
`
✊ **Sasso Carta Forbice**

Scrivi:
sasso
carta
forbice
`
    );


    const msg =
        await collectMessage(interaction,20);


    if(!msg)
        return;


    const bot =
        ["sasso","carta","forbice"]
        [
            Math.floor(
                Math.random()*3
            )
        ];



    interaction.channel.send(
`
Tu: ${msg.content}

Bot: ${bot}
`
    );

}





function collectMessage(interaction,time){


    return interaction.channel.awaitMessages({

        filter:
        m => !m.author.bot,

        max:1,

        time:time*1000

    })
    .then(c=>c.first())
    .catch(()=>null);

}





function wait(ms){

    return new Promise(
        resolve=>setTimeout(resolve,ms)
    );

                  }
