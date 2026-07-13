const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");


const STAFF_ROLES = [
    "1505192718068879430",
    "1505192964769714287"
];


const POLL_CHANNEL =
"1526084048030793728";


const FILE =
path.join(
    __dirname,
    "../polls.json"
);



function loadPolls(){

    if(!fs.existsSync(FILE)){

        fs.writeFileSync(
            FILE,
            "[]"
        );

    }


    return JSON.parse(
        fs.readFileSync(
            FILE,
            "utf8"
        )
    );

}



function savePolls(data){

    fs.writeFileSync(
        FILE,
        JSON.stringify(
            data,
            null,
            2
        )
    );

}



function createEmbed(poll){


const emojis = [
"1️⃣",
"2️⃣",
"3️⃣",
"4️⃣"
];


return new EmbedBuilder()

.setTitle(
"⚜️ ELEGANCE POLL"
)

.setDescription(

`## 📊 ${poll.question}\n\n`

+

poll.options.map(

(o,i)=>

`${emojis[i]} **${o}** — ${poll.votes[i]} voti`

)

.join("\n")

+

`\n\n👥 Votanti: ${poll.voters.length}`

)

.setColor(
0x5865F2
)

.setFooter({

text:
`Creato da ${poll.creator}`

})

.setTimestamp();


}



function createButtons(poll){


const row =
new ActionRowBuilder();



const emojis = [
"1️⃣",
"2️⃣",
"3️⃣",
"4️⃣"
];



poll.options.forEach(
(option,index)=>{


row.addComponents(

new ButtonBuilder()

.setCustomId(
`poll_vote_${poll.id}_${index}`
)

.setLabel(
`${emojis[index]} ${option}`
)

.setStyle(
ButtonStyle.Primary
)

);


});



row.addComponents(

new ButtonBuilder()

.setCustomId(
`poll_results_${poll.id}`
)

.setLabel(
"📊 Risultati"
)

.setStyle(
ButtonStyle.Secondary
)

);



return row;


}



module.exports = {


data:

new SlashCommandBuilder()

.setName("poll")

.setDescription(
"Crea un sondaggio Elegance"
)

.addStringOption(option =>

option

.setName("domanda")

.setDescription(
"Domanda del sondaggio"
)

.setRequired(true)

)


.addStringOption(option =>

option

.setName("opzione1")

.setDescription(
"Prima opzione"
)

.setRequired(true)

)


.addStringOption(option =>

option

.setName("opzione2")

.setDescription(
"Seconda opzione"
)

.setRequired(true)

)


.addStringOption(option =>

option

.setName("opzione3")

.setDescription(
"Terza opzione"
)

.setRequired(false)

)


.addStringOption(option =>

option

.setName("opzione4")

.setDescription(
"Quarta opzione"
)

.setRequired(false)

),





async execute(interaction){



if(

!STAFF_ROLES.some(

role =>

interaction.member.roles.cache.has(role)

)

){

return interaction.reply({

content:
"❌ Non hai il permesso di creare sondaggi.",

ephemeral:true

});

}




if(

interaction.channel.id !== POLL_CHANNEL

){

return interaction.reply({

content:

`❌ Usa il canale <#${POLL_CHANNEL}>.`,

ephemeral:true

});

}




const options = [

interaction.options.getString("opzione1"),

interaction.options.getString("opzione2"),

interaction.options.getString("opzione3"),

interaction.options.getString("opzione4")

].filter(Boolean);




const poll = {

id:
Date.now().toString(),

question:

interaction.options.getString("domanda"),

options,

votes:

options.map(
()=>0
),

voters:[],

creator:

interaction.user.tag,

messageId:null,

channelId:

interaction.channel.id

};




const embed =

createEmbed(
poll
);



const message =

await interaction.reply({

embeds:[
embed
],

components:[

createButtons(
poll
)

],

fetchReply:true

});




poll.messageId =
message.id;




const polls =
loadPolls();



polls.push(
poll
);



savePolls(
polls
);



},




buttonHandler: async function(interaction){



const parts =

interaction.customId.split("_");



const action =
parts[1];



const pollId =
parts[2];



let polls =
loadPolls();



const poll =

polls.find(

p =>
p.id === pollId

);



if(!poll){

return interaction.reply({

content:
"❌ Poll non trovato.",

ephemeral:true

});

}





// RISULTATI

if(action === "results"){



return interaction.reply({

embeds:[

createEmbed(
poll
)

],

ephemeral:true

});

}





// VOTO

if(action === "vote"){



const option =

Number(parts[3]);



const userId =

interaction.user.id;



const oldVote =

poll.voters.find(

v =>
v.user === userId

);





if(oldVote){



poll.votes[
oldVote.option
]--;



oldVote.option =
option;



poll.votes[
option
]++;



}

else{



poll.voters.push({

user:
userId,

option

});


poll.votes[
option
]++;


}





savePolls(
polls
);




const channel =

await interaction.guild.channels.fetch(
poll.channelId
);



const msg =

await channel.messages.fetch(
poll.messageId
);



await msg.edit({

embeds:[

createEmbed(
poll
)

],

components:[

createButtons(
poll
)

]

});





return interaction.reply({

content:
"✅ Voto registrato!",

ephemeral:true

});

}



}


};

