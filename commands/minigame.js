const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const gameSystem = require("./gameSystem");


// ===============================
// GAME STATUS
// ===============================

const activeGames = new Set();


// ===============================
// ANTI RIPETIZIONE
// ===============================

const recentGames = {

    quiz: [],
    memory: [],
    word: [],
    reaction: [],
    hangman: []

};



// ===============================
// QUIZ DATABASE
// ===============================

const quizzes = [

{
id:1,
question:"Qual è il pianeta più grande del Sistema Solare?",
answer:"giove"
},

{
id:2,
question:"Qual è la capitale dell'Italia?",
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
question:"Qual è il satellite naturale della Terra?",
answer:"luna"
},

{
id:6,
question:"Qual è l'animale più grande del mondo?",
answer:"balenottera azzurra"
},

{
id:7,
question:"Quanti giorni ha una settimana?",
answer:"7"
},

{
id:8,
question:"Qual è la capitale della Francia?",
answer:"parigi"
},

{
id:9,
question:"Quale linguaggio viene usato principalmente per creare pagine web?",
answer:"html"
},

{
id:10,
question:"Quanto fa 10 x 10?",
answer:"100"
}

];



// ===============================
// RANDOM QUIZ
// ===============================

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


    const quiz =
    available[
        Math.floor(
            Math.random()*available.length
        )
    ];


    recentGames.quiz.push(
        quiz.id
    );


    if(recentGames.quiz.length > 5){

        recentGames.quiz.shift();

    }


    return quiz;

}



// ===============================
// COMMAND
// ===============================


module.exports = {


data:

new SlashCommandBuilder()

.setName("minigame")

.setDescription(
"Apri il Minigame Hub"
),




async execute(interaction){



const embed = new EmbedBuilder()

.setTitle(
"🎮 Minigame Hub"
)

.setDescription(

`
Scegli il minigame.

━━━━━━━━━━━━━━

🎯 Indovina Numero

🧠 Quiz

🧩 Memory

🔤 Parola Misteriosa

⚡ Reaction

🪢 Impiccato

━━━━━━━━━━━━━━

Ogni gioco assegna:

⭐ XP

🏆 Achievement

🪙 Ricompense

`

)

.setColor("Gold");





const row = new ActionRowBuilder()

.addComponents(


new ButtonBuilder()

.setCustomId(
"game_number"
)

.setLabel(
"🎯 Numero"
)

.setStyle(
ButtonStyle.Primary
),



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




// ===============================
// XP SYSTEM
// ===============================


function win(userId,xp){


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





// ===============================
// UTILITY
// ===============================


function wait(ms){

return new Promise(

resolve =>

setTimeout(
resolve,
ms
)

);

}





function collectMessage(interaction,time){


return interaction.channel.awaitMessages({

filter:

m =>
!m.author.bot,


max:1,


time:
time*1000


})


.then(c=>c.first())


.catch(()=>null);


}




// ===============================
// NUMBER GAME
// ===============================


async function numberGame(interaction){


const number =

Math.floor(
Math.random()*10
)+1;



await interaction.channel.send(

`
🎯 **Indovina il numero**

Sto pensando ad un numero da 1 a 10.

Hai 20 secondi.
`

);



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
msg.content === String(number)
){


const achievements =

win(
msg.author.id,
25
);



return interaction.channel.send(

`
🏆 Hai vinto!

Numero:

**${number}**

⭐ +25 XP

${achievements.join("\n")}
`

);



}



lose(
msg.author.id
);



interaction.channel.send(

`
❌ Hai perso!

Il numero era:

**${number}**

⭐ +5 XP

`

);



}




// ===============================
// QUIZ GAME
// ===============================


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

Hai 20 secondi.

Scrivi la risposta in chat.
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

// ===============================
// MEMORY GAME
// ===============================


const colors = [

"🔴",
"🔵",
"🟢",
"🟡",
"🟣",
"🟠"

];



async function memoryGame(interaction){


const length =

Math.floor(
Math.random()*3
)+3;



let sequence = [];



for(let i = 0; i < length; i++){

sequence.push(

colors[

Math.floor(
Math.random()*colors.length
)

]

);

}




await interaction.channel.send(

`
🧩 **MEMORY**

Memorizza questa combinazione:

${sequence.join(" ")}

Hai pochi secondi...
`

);



await wait(5000);



for(let i = 5; i > 0; i--){

await interaction.channel.send(

`⏳ Distrazione: ${i}`

);

await wait(1000);

}




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




const answer =

msg.content
.trim()
.split(" ");



if(

JSON.stringify(answer)

===

JSON.stringify(sequence)

){



const achievements =

win(
msg.author.id,
40
);



return interaction.channel.send(

`
🏆 Memory completato!

Combinazione corretta:

${sequence.join(" ")}

⭐ +40 XP

${achievements.join("\n")}
`

);



}



lose(
msg.author.id
);



interaction.channel.send(

`
❌ Memory fallito!

La combinazione era:

${sequence.join(" ")}

Hai scritto:

${answer.join(" ")}
`

);



}







// ===============================
// PAROLA MISTERIOSA
// ===============================



const words = {

easy:[

"cane",
"sole",
"mare"

],

medium:[

"discord",
"computer",
"galassia"

],

hard:[

"javascript",
"astronomia",
"programmazione"

]

};





async function wordGame(interaction){



const difficulty =

[
"easy",
"medium",
"hard"

][

Math.floor(
Math.random()*3
)

];



const list =

words[difficulty];



const word =

list[

Math.floor(
Math.random()*list.length
)

];



let attempts = 5;



await interaction.channel.send(

`
🔤 **PAROLA MISTERIOSA**

Difficoltà:

**${difficulty}**

Indovina la parola.

Tentativi:

${attempts}

Hai 30 secondi.
`

);



const msg =

await collectMessage(
interaction,
30
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

word

){


let xp = 20;


if(difficulty==="medium")
xp = 40;


if(difficulty==="hard")
xp = 70;



const achievements =

win(
msg.author.id,
xp
);



return interaction.channel.send(

`
🏆 Parola trovata!

La parola era:

**${word}**

⭐ +${xp} XP

${achievements.join("\n")}
`

);



}



lose(
msg.author.id
);



interaction.channel.send(

`
❌ Hai perso!

La parola era:

**${word}**
`

);



}







// ===============================
// REACTION GAME
// ===============================



async function reactionGame(interaction){



const messages = [

"Preparati",

"Concentrati",

"Sta arrivando"

];



for(const text of messages){


await interaction.channel.send(

`⚡ ${text}`

);


await wait(2000);

}




const positions = [

"titolo",
"testo",
"footer"

];



const position =

positions[

Math.floor(
Math.random()*positions.length
)

];



let embed =

new EmbedBuilder()

.setTitle(
"⚡ Reaction"
)

.setDescription(
"Trova il simbolo verde 🟢"
)

.setColor("Green");




if(position==="titolo"){

embed.setTitle(
"🟢 Reaction"
);

}



if(position==="testo"){

embed.setDescription(
"Trova questo: 🟢"
);

}



if(position==="footer"){

embed.setFooter({

text:
"🟢"

});

}



const message =

await interaction.channel.send({

embeds:[
embed
]

});



const start =
Date.now();



const answer =

await message.channel.awaitMessages({

filter:

m =>

!m.author.bot &&

m.content.includes("🟢"),


max:1,


time:10000

})

.catch(()=>null);



if(!answer){

return interaction.channel.send(
"❌ Troppo lento!"
);

}



const time =

Date.now()-start;



const xp =

Math.max(
10,
60-Math.floor(time/100)
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

${time}ms

⭐ +${xp} XP

${achievements.join("\n")}
`

);



}






// ===============================
// IMPICCATO
// ===============================



const hangmanWords = [

"javascript",
"discord",
"astronomia",
"galassia",
"computer"

];



const hangmanParts = [

"",
"O",
"O\n|",
"O\n/|",
"O\n/|\\\\",
"O\n/|\\\\\n/",
"O\n/|\\\\\n/ \\"

];





async function hangmanGame(interaction){



const word =

hangmanWords[

Math.floor(
Math.random()*hangmanWords.length
)

];



let used = [];

let errors = 0;



function display(){


return word

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

}



let msg =

await interaction.channel.send(

`
🪢 **IMPICCATO**

${hangmanParts[errors]}

${display()}

Scrivi una lettera.
Errori: ${errors}/6
`

);



while(errors < 6){



const answer =

await collectMessage(
interaction,
60
);



if(!answer)
break;



const letter =

answer.content
.toLowerCase()
.trim();




if(letter.length !== 1)
continue;



if(used.includes(letter)){

continue;

}



used.push(letter);



if(!word.includes(letter)){

errors++;

}



if(

word.split("")

.every(

x => used.includes(x)

)

){



const achievements =

win(
answer.author.id,
60
);



return interaction.channel.send(

`
🏆 Hai vinto l'Impiccato!

Parola:

**${word}**

⭐ +60 XP

${achievements.join("\n")}
`

);



}



await msg.edit(

`
🪢 **IMPICCATO**

${hangmanParts[errors]}

${display()}

Errori:

${errors}/6

Lettere:

${used.join(", ")}
`

);



}



interaction.channel.send(

`
💀 Hai perso!

La parola era:

**${word}**

⭐ +5 XP
`

);



}




// ===============================
// EXPORT
// ===============================


module.exports.quizGame = quizGame;
module.exports.numberGame = numberGame;
module.exports.memoryGame = memoryGame;
module.exports.wordGame = wordGame;
module.exports.reactionGame = reactionGame;
module.exports.hangmanGame = hangmanGame;
