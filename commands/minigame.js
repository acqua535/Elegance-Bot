// PARTE 1/2 - MINIGAME.JS
// Base system:
// - Minigame Hub
// - Anti raid
// - Quiz avanzato
// - XP system hook
// - Achievement hook
// - ButtonHandler globale compatibile


const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const gameSystem = require("./gameSystem");



// ============================
// ACTIVE GAMES
// ============================

const activeGames = new Set();



// ============================
// RECENT GAMES
// ============================

const recentGames = {

    quiz: []

};



// ============================
// QUIZ DATABASE
// ============================

const quizzes = [

{
id:1,
question:"Qual è il pianeta più grande del Sistema Solare?",
answer:"giove"
},

{
id:2,
question:"Qual è la capitale d'Italia?",
answer:"roma"
},

{
id:3,
question:"Quanto fa 5 + 7?",
answer:"12"
},

{
id:4,
question:"Chi ha scritto la Divina Commedia?",
answer:"dante"
},

{
id:5,
question:"Quanti continenti ci sono?",
answer:"7"
},

{
id:6,
question:"Qual è il mammifero più grande del mondo?",
answer:"balena azzurra"
},

{
id:7,
question:"Qual è il satellite naturale della Terra?",
answer:"luna"
},

{
id:8,
question:"Qual è la stella più vicina alla Terra?",
answer:"sole"
},

{
id:9,
question:"In che anno è iniziata la Seconda Guerra Mondiale?",
answer:"1939"
},

{
id:10,
question:"Qual è la lingua più parlata al mondo?",
answer:"cinese"
},

{
id:11,
question:"Qual è il simbolo chimico dell'acqua?",
answer:"h2o"
},

{
id:12,
question:"Quanti lati ha un esagono?",
answer:"6"
},

{
id:13,
question:"Qual è il pianeta rosso?",
answer:"marte"
},

{
id:14,
question:"Chi ha inventato la lampadina?",
answer:"edison"
},

{
id:15,
question:"Qual è l'animale terrestre più veloce?",
answer:"ghepardo"
},

{
id:16,
question:"Qual è il continente più grande?",
answer:"asia"
},

{
id:17,
question:"Quanto fa 9 x 9?",
answer:"81"
},

{
id:18,
question:"Qual è la capitale della Francia?",
answer:"parigi"
},

{
id:19,
question:"Qual è il colore del cielo in una giornata serena?",
answer:"blu"
},

{
id:20,
question:"Quale gas respiriamo principalmente?",
answer:"ossigeno"
},

{
id:21,
question:"Qual è il pianeta più vicino al Sole?",
answer:"mercurio"
},

{
id:22,
question:"Quanti giorni ha un anno normale?",
answer:"365"
},

{
id:23,
question:"Qual è il nome del nostro pianeta?",
answer:"terra"
},

{
id:24,
question:"Quale animale viene chiamato re della savana?",
answer:"leone"
},

{
id:25,
question:"Qual è la capitale della Spagna?",
answer:"madrid"
},

{
id:26,
question:"Quante ore ci sono in un giorno?",
answer:"24"
},

{
id:27,
question:"Qual è il più grande oceano della Terra?",
answer:"pacifico"
},

{
id:28,
question:"Quale strumento misura la temperatura?",
answer:"termometro"
},

{
id:29,
question:"Qual è il pianeta con gli anelli più famosi?",
answer:"saturno"
},

{
id:30,
question:"Quanti colori ha l'arcobaleno?",
answer:"7"
}

];



// ============================
// RANDOM QUIZ SYSTEM
// ============================


function getRandomQuiz(){


    let available =
    quizzes.filter(
        q =>
        !recentGames.quiz.includes(q.id)
    );


    if(available.length === 0){

        recentGames.quiz = [];

        available = quizzes;

    }


    const selected =
    available[
        Math.floor(
            Math.random() *
            available.length
        )
    ];


    recentGames.quiz.push(
        selected.id
    );


    if(recentGames.quiz.length > 10){

        recentGames.quiz.shift();

    }


    return selected;

}





// ============================
// XP SYSTEM
// ============================


function win(userId, xp){


    gameSystem.addXP(
        userId,
        xp
    );


    return gameSystem.checkAchievements(
        userId
    );


}



function lose(userId){


    gameSystem.addXP(
        userId,
        5
    );


}





// ============================
// COMMAND
// ============================


module.exports = {


data:

new SlashCommandBuilder()

.setName("minigame")

.setDescription(
"Apri il Minigame Hub"
),



async execute(interaction){


    if(
        activeGames.has(
            interaction.channel.id
        )
    ){

        return interaction.reply({

            content:
            "⚠️ Un minigame è già attivo in questo canale!",

            ephemeral:true

        });

    }



    const embed = new EmbedBuilder()

    .setTitle(
        "🎮 Minigame Hub"
    )

    .setDescription(

`
Scegli un minigame.

━━━━━━━━━━━━━━

🎯 Indovina Numero

🧠 Quiz

🧩 Memory

🔤 Parola Misteriosa

⚡ Reaction

🪢 Impiccato

━━━━━━━━━━━━━━

⭐ XP
🏆 Achievement
🪙 Ricompense

Buona fortuna!
`

    )

    .setColor("Gold");





    const row =
    new ActionRowBuilder()

    .addComponents(


        new ButtonBuilder()

        .setCustomId(
            "game_quiz"
        )

        .setLabel(
            "🧠 Quiz"
        )

        .setStyle(
            ButtonStyle.Success
        ),



        new ButtonBuilder()

        .setCustomId(
            "game_memory"
        )

        .setLabel(
            "🧩 Memory"
        )

        .setStyle(
            ButtonStyle.Secondary
        ),



        new ButtonBuilder()

        .setCustomId(
            "game_word"
        )

        .setLabel(
            "🔤 Parola"
        )

        .setStyle(
            ButtonStyle.Primary
        ),



        new ButtonBuilder()

        .setCustomId(
            "game_reaction"
        )

        .setLabel(
            "⚡ Reaction"
        )

        .setStyle(
            ButtonStyle.Primary
        ),



        new ButtonBuilder()

        .setCustomId(
            "game_hangman"
        )

        .setLabel(
            "🪢 Impiccato"
        )

        .setStyle(
            ButtonStyle.Danger
        )

    );



    await interaction.reply({

        embeds:[
            embed
        ],

        components:[
            row
        ]

    });


}



};





// ============================
// QUIZ GAME
// ============================


async function quizGame(interaction){


const quiz =
getRandomQuiz();



await interaction.channel.send({

embeds:[

new EmbedBuilder()

.setTitle(
"🧠 Quiz"
)

.setDescription(

`
${quiz.question}

Hai **20 secondi**.

Scrivi la risposta.
`

)

.setColor("Blue")

]

});



const msg =
await collectMessage(
interaction,
20
);



if(!msg){

return interaction.channel.send(
"⏰ Tempo scaduto!"
);

}



if(
msg.content
.toLowerCase()
.trim()
===
quiz.answer
){


const achievements =
win(
msg.author.id,
25
);



return interaction.channel.send(

`
🏆 Risposta corretta!

⭐ +25 XP
🪙 +50 monete

${achievements.join("\n")}
`

);



}



lose(
msg.author.id
);



interaction.channel.send(

`
❌ Risposta errata!

Era:

**${quiz.answer}**

⭐ +5 XP
`

);


}




module.exports.quizGame =
quizGame;




function collectMessage(interaction,time){


return interaction.channel.awaitMessages({

filter:

m =>
!m.author.bot,


max:1,


time:
time * 1000


})

.then(c => c.first())

.catch(() => null);


}

// PARTE 2/2 - MINIGAME.JS
// Memory
// Parola Misteriosa
// Reaction
// Impiccato
// Button handlers export


// ============================
// MEMORY GAME
// ============================


const memoryColors = [
    "🔴",
    "🔵",
    "🟢",
    "🟡",
    "🟣",
    "🟠"
];



function randomColors(){


    const amount =
    Math.floor(Math.random() * 3) + 4;


    let result = [];


    for(let i = 0; i < amount; i++){

        result.push(
            memoryColors[
                Math.floor(
                    Math.random() *
                    memoryColors.length
                )
            ]
        );

    }


    return result;

}




async function memoryGame(interaction){


    const sequence =
    randomColors();



    const msg =
    await interaction.channel.send(

`
🧩 **MEMORY**

Memorizza questa sequenza:

${sequence.join(" ")}

Hai **3 secondi**.
`

    );



    await wait(3000);



    await msg.edit(

`
🧩 **MEMORY**

❌ Sequenza nascosta.

Preparati...

Distrazione:
`

    );



    for(
        let i = 5;
        i > 0;
        i--
    ){

        await msg.edit(

`
🧩 Distrazione...

⏳ ${i}
`

        );

        await wait(1000);

    }



    await msg.edit(

`
🧩 **MEMORY**

Scrivi la sequenza corretta.

Esempio:

🔴 🔵 🟢
`

    );



    const answer =
    await collectMessage(
        interaction,
       20
    );



    if(!answer)
    return;



    const user =
    answer.content
    .trim();



    const correct =
    sequence.join("");



    if(
        user.replaceAll(" ","")
        ===
        correct
    ){


        const achievements =
        win(
            answer.author.id,
            50
        );


        return interaction.channel.send(

`
🏆 Memory completato!

⭐ +50 XP

${achievements.join("\n")}
`

        );


    }



    lose(
        answer.author.id
    );


    interaction.channel.send(

`
❌ Sequenza errata!

Era:

${sequence.join(" ")}

⭐ +5 XP
`

    );


}





// ============================
// PAROLA MISTERIOSA
// ============================


const mysteryWords = {


facile:[

"sole",
"luna",
"marte",
"cane",
"mare"

],


medio:[

"galassia",
"computer",
"discord",
"pianeta",
"astronomia"

],


difficile:[

"javascript",
"costellazione",
"programmazione",
"universo"

]


};





async function wordGame(interaction){


const row =
new ActionRowBuilder()

.addComponents(


new ButtonBuilder()

.setCustomId(
"word_easy"
)

.setLabel(
"🟢 Facile"
)

.setStyle(
ButtonStyle.Success
),


new ButtonBuilder()

.setCustomId(
"word_medium"
)

.setLabel(
"🟡 Medio"
)

.setStyle(
ButtonStyle.Primary
),


new ButtonBuilder()

.setCustomId(
"word_hard"
)

.setLabel(
"🔴 Difficile"
)

.setStyle(
ButtonStyle.Danger
)


);



await interaction.channel.send({

content:

"🔤 Scegli difficoltà:",

components:[row]

});



}




async function startWordGame(
interaction,
difficulty
){



const list =
mysteryWords[difficulty];



const word =
list[
Math.floor(
Math.random()*list.length
)
];



await interaction.channel.send(

`
🔤 **PAROLA MISTERIOSA**

Categoria:
🌎 Generale

Lettere:

${word.length}

Parola:

${"_ ".repeat(word.length)}

Hai 30 secondi.

Scrivi la parola.
`

);



const msg =
await collectMessage(
interaction,
30
);



if(!msg)
return;



if(
msg.content
.toLowerCase()
.trim()
===
word
){



const xp =
difficulty==="facile"
?
20
:
difficulty==="medio"
?
40
:
70;



const achievements =
win(
msg.author.id,
xp
);



interaction.channel.send(

`
🏆 Parola trovata!

⭐ +${xp} XP

${achievements.join("\n")}
`

);



}else{


lose(
msg.author.id
);


interaction.channel.send(

`
❌ Risposta errata!

La parola era:

**${word}**
`

);


}


}





// ============================
// REACTION GAME
// ============================


async function reactionGame(interaction){



const messages = [

"Preparati",

"Concentrati",

"Attendi"

];



for(
const m of messages
){

const x =
await interaction.channel.send(
`⚡ ${m}`
);

await wait(2000);

await x.delete()
.catch(()=>{});

}



const places = [

"titolo",
"testo",
"footer"

];



const position =
places[
Math.floor(
Math.random()*places.length
)
];



let embed =
new EmbedBuilder()

.setTitle(
"⚡ Reaction"
)

.setDescription(
"Trova 🟢"
)

.setColor("Green");



if(position==="titolo")

embed.setTitle(
"🟢 Reaction"
);



if(position==="footer")

embed.setFooter({

text:
"🟢"

});



const msg =
await interaction.channel.send({

embeds:[
embed
]

});



const start =
Date.now();



const answer =
await msg.channel.awaitMessages({

filter:

m =>
!m.author.bot &&
m.content.includes("🟢"),


max:1,

time:10000

})

.catch(()=>null);



if(!answer)
return;



const ms =
Date.now()-start;



const xp =
Math.max(
10,
60 - Math.floor(ms/100)
);



const achievements =
win(
answer.first().author.id,
xp
);



interaction.channel.send(

`
⚡ Reaction completata!

Tempo:
${ms}ms

⭐ +${xp} XP

${achievements.join("\n")}
`

);



}





// ============================
// IMPICCATO
// ============================


const hangmanWords = [

"javascript",
"discord",
"astronomia",
"galassia",
"computer"

];



const hangman = [

"",
" O ",
" O\n |",
" O\n/|",
" O\n/|\\",
" O\n/|\\\n/",
" O\n/|\\\n/ \\"

];





async function hangmanGame(interaction){



const word =
hangman[
Math.floor(
Math.random()*hangmanWords.length
)
];



let used = [];

let errors = 0;



while(errors < 6){



const display =
word
.split("")
.map(
x =>
used.includes(x)
?
x
:
"⬜"
)
.join(" ");



const msg =
await interaction.channel.send(

`
🪢 **IMPICCATO**

${hangman[errors]}

${display}

Errori:
${errors}/6

Lettera:
`

);



const answer =
await collectMessage(
interaction,
60
);



if(!answer)
return;



const letter =
answer.content
.toLowerCase()
.trim();



if(
letter.length!==1
)
continue;



if(
used.includes(letter)
)
continue;



used.push(letter);



if(
!word.includes(letter)
)
errors++;



if(
word
.split("")
.every(
x =>
used.includes(x)
)
){


const achievements =
win(
answer.author.id,
60
);



return interaction.channel.send(

`
🏆 Hai vinto l'impiccato!

Parola:
**${word}**

⭐ +60 XP

${achievements.join("\n")}
`

);


}


}



interaction.channel.send(

`
💀 Hai perso!

La parola era:

**${word}**
`

);



}




// ============================
// EXPORT BUTTON FUNCTIONS
// ============================


module.exports.memoryGame =
memoryGame;


module.exports.wordGame =
wordGame;


module.exports.startWordGame =
startWordGame;


module.exports.reactionGame =
reactionGame;


module.exports.hangmanGame =
hangmanGame;





// ============================
// UTILS
// ============================


function wait(ms){

return new Promise(
resolve =>
setTimeout(
resolve,
ms
)
);

    }
