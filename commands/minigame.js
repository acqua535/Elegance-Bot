const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const gameSystem = require("./gameSystem");

let activeGame = false;


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


const games = {

    number: "🎯 Indovina il Numero",

    quiz: "🧠 Quiz",

    coin: "🪙 Testa o Croce",

    dice: "🎲 Dado",

    rps: "✊ Sasso Carta Forbice"

};



module.exports = {


    data: new SlashCommandBuilder()

        .setName("minigame")

        .setDescription("Apri il Minigame Hub"),



    async execute(interaction) {


        if(activeGame) {

            return interaction.reply({

                content:
                "⚠️ Un minigame è già in corso!",

                ephemeral:true

            });

        }



        const row = new ActionRowBuilder()

        .addComponents(


            new ButtonBuilder()

            .setCustomId("game_number")

            .setLabel("🎯 Numero")

            .setStyle(ButtonStyle.Primary),



            new ButtonBuilder()

            .setCustomId("game_quiz")

            .setLabel("🧠 Quiz")

            .setStyle(ButtonStyle.Success),



            new ButtonBuilder()

            .setCustomId("game_coin")

            .setLabel("🪙 Testa/Croce")

            .setStyle(ButtonStyle.Secondary),



            new ButtonBuilder()

            .setCustomId("game_dice")

            .setLabel("🎲 Dado")

            .setStyle(ButtonStyle.Primary),



            new ButtonBuilder()

            .setCustomId("game_rps")

            .setLabel("✊ Sasso")

            .setStyle(ButtonStyle.Danger)

        );





        const embed = new EmbedBuilder()

        .setTitle("🎮 Minigame Hub")

        .setDescription(

`
Scegli quale minigame vuoi giocare.

━━━━━━━━━━━━━━

🎯 Indovina il Numero

🧠 Quiz

🪙 Testa o Croce

🎲 Dado

✊ Sasso Carta Forbice

━━━━━━━━━━━━━━

Buona fortuna! 🍀
`

        )

        .setColor("Gold");





        await interaction.reply({

            embeds:[embed],

            components:[row]

        });


    }


};





function gameWin(userId){


    gameSystem.gameWin(userId);


    const unlocked =
    gameSystem.checkAchievements(userId);



    if(unlocked.length > 0){

        return unlocked;

    }


    return [];

}





function gameLose(userId){


    gameSystem.gameLose(userId);



    const unlocked =
    gameSystem.checkAchievements(userId);



    if(unlocked.length > 0){

        return unlocked;

    }


    return [];

}





async function numberGame(interaction){


    const number =
    Math.floor(Math.random()*10)+1;



    await interaction.channel.send(

`
🎯 **Indovina il numero**

Sto pensando ad un numero da **1 a 10**.

Hai 20 secondi!
`

    );



    const msg =
    await collectMessage(interaction,20);



    if(!msg)

        return interaction.channel.send(
            "⏰ Tempo scaduto!"
        );



    if(msg.content === String(number)){


        const achievements =
        gameWin(msg.author.id);



        return interaction.channel.send(

`
🏆 ${msg.author} ha vinto!

Numero corretto: **${number}**

⭐ +25 XP
🪙 +50 monete

${achievements.join("\n")}
`

        );


    }



    gameLose(msg.author.id);



    interaction.channel.send(

`
❌ Hai perso!

Il numero era **${number}**

⭐ +5 XP
`

    );


}

async function quizGame(interaction){


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

Hai 20 secondi!
`

    );



    const msg =
    await collectMessage(interaction,20);



    if(!msg)
        return;



    if(
        msg.content.toLowerCase()
        === q.answer
    ){


        const achievements =
        gameWin(msg.author.id);



        interaction.channel.send(

`
🏆 Risposta corretta!

⭐ +25 XP
🪙 +50 monete

${achievements.join("\n")}
`

        );


    } else {


        gameLose(msg.author.id);


        interaction.channel.send(

`
❌ Risposta errata!

Era **${q.answer}**

⭐ +5 XP
`

        );


    }


}





async function coinGame(interaction){


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
    ?
    "testa"
    :
    "croce";



    const btn =
    await msg.awaitMessageComponent({

        time:20000

    }).catch(()=>null);



    if(!btn)

        return msg.edit({

            content:"⏰ Tempo scaduto!",

            components:[]

        });



    if(btn.customId === result){


        const achievements =
        gameWin(btn.user.id);



        return btn.update({

            content:

`
🏆 Hai vinto!

Era **${result}**

⭐ +25 XP
🪙 +50 monete

${achievements.join("\n")}
`,

            components:[]

        });


    }



    gameLose(btn.user.id);



    btn.update({

        content:

`
❌ Hai perso!

Era **${result}**

⭐ +5 XP
`,

        components:[]

    });


}






async function diceGame(interaction){


    const roll =
    Math.floor(Math.random()*6)+1;



    await interaction.channel.send(

`
🎲 **Dado**

Indovina il numero da **1 a 6**.

Hai 20 secondi!
`

    );



    const msg =
    await collectMessage(interaction,20);



    if(!msg)

        return interaction.channel.send(
            "⏰ Tempo scaduto!"
        );



    if(msg.content === String(roll)){


        const achievements =
        gameWin(msg.author.id);



        interaction.channel.send(

`
🏆 ${msg.author} ha vinto!

Il numero era **${roll}**

⭐ +25 XP
🪙 +50 monete

${achievements.join("\n")}
`

        );


    } else {


        gameLose(msg.author.id);



        interaction.channel.send(

`
❌ Hai perso!

Il numero era **${roll}**

⭐ +5 XP
`

        );


    }


}







async function rpsGame(interaction){


    await interaction.channel.send(

`
✊ **Sasso Carta Forbice**

Scrivi:

sasso
carta
forbice

Hai 20 secondi!
`

    );



    const msg =
    await collectMessage(interaction,20);



    if(!msg)

        return interaction.channel.send(
            "⏰ Tempo scaduto!"
        );



    const player =
    msg.content.toLowerCase();



    if(
        player !== "sasso" &&
        player !== "carta" &&
        player !== "forbice"
    ){

        return interaction.channel.send(
            "❌ Scelta non valida!"
        );

    }



    const bot =
    [
        "sasso",
        "carta",
        "forbice"
    ][
        Math.floor(Math.random()*3)
    ];



    let result = "pareggio";



    if(
        (player==="sasso" && bot==="forbice") ||
        (player==="carta" && bot==="sasso") ||
        (player==="forbice" && bot==="carta")
    ){

        result="win";

    }



    if(
        (bot==="sasso" && player==="forbice") ||
        (bot==="carta" && player==="sasso") ||
        (bot==="forbice" && player==="carta")
    ){

        result="lose";

    }



    if(result==="win"){


        const achievements =
        gameWin(msg.author.id);



        return interaction.channel.send(

`
🏆 Hai vinto!

Tu: **${player}**
Bot: **${bot}**

⭐ +25 XP
🪙 +50 monete

${achievements.join("\n")}
`

        );

    }



    if(result==="lose"){


        gameLose(msg.author.id);



        return interaction.channel.send(

`
❌ Hai perso!

Tu: **${player}**
Bot: **${bot}**

⭐ +5 XP
`

        );

    }



    interaction.channel.send(

`
🤝 Pareggio!

Tu: **${player}**
Bot: **${bot}**
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

    .then(c => c.first())

    .catch(() => null);


}





// ================================
// BUTTON HANDLER GLOBALE
// ================================


module.exports.buttonHandler = async function(interaction){


    switch(interaction.customId){


        case "game_number":

            await interaction.update({

                content:"🎯 Indovina il Numero avviato!",

                embeds:[],

                components:[]

            });

            activeGame = true;

            await numberGame(interaction);

            activeGame = false;

            break;



        case "game_quiz":

            await interaction.update({

                content:"🧠 Quiz avviato!",

                embeds:[],

                components:[]

            });

            activeGame = true;

            await quizGame(interaction);

            activeGame = false;

            break;



        case "game_coin":

            await interaction.update({

                content:"🪙 Testa o Croce avviato!",

                embeds:[],

                components:[]

            });

            activeGame = true;

            await coinGame(interaction);

            activeGame = false;

            break;



        case "game_dice":

            await interaction.update({

                content:"🎲 Dado avviato!",

                embeds:[],

                components:[]

            });

            activeGame = true;

            await diceGame(interaction);

            activeGame = false;

            break;



        case "game_rps":

            await interaction.update({

                content:"✊ Sasso Carta Forbice avviato!",

                embeds:[],

                components:[]

            });

            activeGame = true;

            await rpsGame(interaction);

            activeGame = false;

            break;


    }


};
