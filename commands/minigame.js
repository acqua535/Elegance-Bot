const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const gameSystem = require("./gameSystem");


let activeGames = new Set();



const recentGames = {

    quiz: [],

    memory: [],

    word: [],

    reaction: [],

    hangman: []

};



// =========================
// QUIZ DATABASE
// =========================


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
question:"Quanto fa 5+7?",
answer:"12"
},

{
id:4,
question:"Chi ha scritto la Divina Commedia?",
answer:"dante"
},

{
id:5,
question:"Quanti continenti esistono?",
answer:"7"
},

{
id:6,
question:"Qual è il mammifero più grande del mondo?",
answer:"balenottera azzurra"
}

];





function getRandomQuiz(){


    let available =
    quizzes.filter(
        q =>
        !recentGames.quiz.includes(q.id)
    );



    if(available.length===0){

        recentGames.quiz=[];

        available=quizzes;

    }



    const selected =
    available[
        Math.floor(
            Math.random()*available.length
        )
    ];



    recentGames.quiz.push(
        selected.id
    );



    if(recentGames.quiz.length>10){

        recentGames.quiz.shift();

    }



    return selected;

}




// =========================
// COMMAND
// =========================


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
Scegli il gioco che vuoi provare.

━━━━━━━━━━━━━━

🎯 Indovina il Numero

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

Buona fortuna!
`

)


.setColor("Gold");




const row =

new ActionRowBuilder()

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

embeds:[embed],

components:[row],

ephemeral:false

});



}



};





// =========================
// FUNZIONI XP
// =========================


function win(userId, amount){


gameSystem.addXP(
userId,
amount
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




// =========================
// QUIZ GAME
// =========================


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

Hai **20 secondi** per rispondere.

Scrivi la risposta in chat.
`

)

.setColor("Blue")

]

});




const msg = await collectMessage(
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

La risposta era:

**${quiz.answer}**

⭐ +5 XP
`

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




module.exports.quizGame =
quizGame;

// ===============================
// REACTION GAME
// ===============================


const reactionPositions = [

"titolo",

"testo",

"footer"

];




async function reactionGame(interaction){



const fakeMessages = [

"Preparati...",

"Concentrati...",

"Quasi pronto..."

];





for(const text of fakeMessages){


await interaction.channel.send({

content:
`⚡ ${text}`

});


await wait(2000);


}




const position =

reactionPositions[

Math.floor(
Math.random()*reactionPositions.length
)

];





let embed =

new EmbedBuilder()

.setTitle(
"⚡ REACTION"
)

.setDescription(
"Trova il cerchio verde!"
)

.setColor("Green");




if(position==="titolo"){

embed.setTitle(
"🟢 REACTION"
);

}


if(position==="testo"){

embed.setDescription(
"Trova il simbolo 🟢!"
);

}



if(position==="footer"){

embed.setFooter({

text:
"🟢"

});

}





const msg =

await interaction.channel.send({

embeds:[embed]

});





const start =
Date.now();





const answer =

await msg.channel.awaitMessages({

filter:

m=>
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
50 - Math.floor(time/100)
);





const achievements =
win(
answer.first().author.id,
xp
);





interaction.channel.send(

`
⚡ Reazione completata!

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

`
 
 


`,


`
 O


`,


`
 O
 |
`,


`
 O
/|
`,


`
 O
/|\\
`,


`
 O
/|\\
/ 
`,


`
 O
/|\\
/ \\

`

];






function randomHangman(){


return hangmanWords[

Math.floor(
Math.random()*hangmanWords.length
)

];


}







async function hangmanGame(interaction){



const word =
randomHangman();




let guessed=[];


let errors=0;


let finished=false;




function display(){


return word

.split("")

.map(

letter =>

guessed.includes(letter)

?

letter

:

"⬜"

)

.join(" ");

}




await interaction.channel.send(

`
🪢 **IMPICCATO**

${hangmanParts[errors]}

Parola:

${display()}


Scrivi una lettera.

Hai 6 errori disponibili.
`

);





while(!finished){



const msg =

await collectMessage(
interaction,
60
);





if(!msg)
break;





const letter =

msg.content

.toLowerCase()

.trim();





if(letter.length!==1){

continue;

}





if(
guessed.includes(letter)
){

await msg.reply(
"⚠️ Lettera già usata!"
);

continue;

}




guessed.push(letter);




if(!word.includes(letter)){


errors++;


}






if(

errors>=6

){


return interaction.channel.send(

`
💀 Hai perso!

${hangmanParts[errors]}

La parola era:

**${word}**

⭐ +5 XP
`

);


}






if(

word

.split("")

.every(

l=>
guessed.includes(l)

)

){


const achievements =
win(
msg.author.id,
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





await interaction.channel.send(

`
🪢 Stato:

${hangmanParts[errors]}

${display()}

❌ Errori:
${errors}/6

Lettere:

${guessed.join(", ")}
`

);



}



}





module.exports.reactionGame =
reactionGame;



module.exports.hangmanGame =
hangmanGame;

// ===============================
// REACTION GAME
// ===============================


const reactionPositions = [

"titolo",

"testo",

"footer"

];




async function reactionGame(interaction){



const fakeMessages = [

"Preparati...",

"Concentrati...",

"Quasi pronto..."

];





for(const text of fakeMessages){


await interaction.channel.send({

content:
`⚡ ${text}`

});


await wait(2000);


}




const position =

reactionPositions[

Math.floor(
Math.random()*reactionPositions.length
)

];





let embed =

new EmbedBuilder()

.setTitle(
"⚡ REACTION"
)

.setDescription(
"Trova il cerchio verde!"
)

.setColor("Green");




if(position==="titolo"){

embed.setTitle(
"🟢 REACTION"
);

}


if(position==="testo"){

embed.setDescription(
"Trova il simbolo 🟢!"
);

}



if(position==="footer"){

embed.setFooter({

text:
"🟢"

});

}





const msg =

await interaction.channel.send({

embeds:[embed]

});





const start =
Date.now();





const answer =

await msg.channel.awaitMessages({

filter:

m=>
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
50 - Math.floor(time/100)
);





const achievements =
win(
answer.first().author.id,
xp
);





interaction.channel.send(

`
⚡ Reazione completata!

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

`
 
 


`,


`
 O


`,


`
 O
 |
`,


`
 O
/|
`,


`
 O
/|\\
`,


`
 O
/|\\
/ 
`,


`
 O
/|\\
/ \\

`

];






function randomHangman(){


return hangmanWords[

Math.floor(
Math.random()*hangmanWords.length
)

];


}







async function hangmanGame(interaction){



const word =
randomHangman();




let guessed=[];


let errors=0;


let finished=false;




function display(){


return word

.split("")

.map(

letter =>

guessed.includes(letter)

?

letter

:

"⬜"

)

.join(" ");

}




await interaction.channel.send(

`
🪢 **IMPICCATO**

${hangmanParts[errors]}

Parola:

${display()}


Scrivi una lettera.

Hai 6 errori disponibili.
`

);





while(!finished){



const msg =

await collectMessage(
interaction,
60
);





if(!msg)
break;





const letter =

msg.content

.toLowerCase()

.trim();





if(letter.length!==1){

continue;

}





if(
guessed.includes(letter)
){

await msg.reply(
"⚠️ Lettera già usata!"
);

continue;

}




guessed.push(letter);




if(!word.includes(letter)){


errors++;


}






if(

errors>=6

){


return interaction.channel.send(

`
💀 Hai perso!

${hangmanParts[errors]}

La parola era:

**${word}**

⭐ +5 XP
`

);


}






if(

word

.split("")

.every(

l=>
guessed.includes(l)

)

){


const achievements =
win(
msg.author.id,
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





await interaction.channel.send(

`
🪢 Stato:

${hangmanParts[errors]}

${display()}

❌ Errori:
${errors}/6

Lettere:

${guessed.join(", ")}
`

);



}



}





module.exports.reactionGame =
reactionGame;



module.exports.hangmanGame =
hangmanGame;
