const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const STAFF_ROLES = [
    "1505192718068879430",
    "1505192964769714287"
];


const POLL_CHANNEL =
"1526084048030793728";



const polls = new Map();



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
    .setDescription("Domanda del sondaggio")
    .setRequired(true)
)

.addStringOption(option =>
    option
    .setName("opzione1")
    .setDescription("Prima opzione")
    .setRequired(true)
)

.addStringOption(option =>
    option
    .setName("opzione2")
    .setDescription("Seconda opzione")
    .setRequired(true)
)

.addStringOption(option =>
    option
    .setName("opzione3")
    .setDescription("Terza opzione")
    .setRequired(false)
)

.addStringOption(option =>
    option
    .setName("opzione4")
    .setDescription("Quarta opzione")
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
`❌ Usa questo comando nel canale <#${POLL_CHANNEL}>.`,

ephemeral:true

});

}



const options = [

interaction.options.getString("opzione1"),

interaction.options.getString("opzione2"),

interaction.options.getString("opzione3"),

interaction.options.getString("opzione4")

].filter(Boolean);



const question =

interaction.options.getString("domanda");



const emojis = [
"🟦",
"🟩",
"🟨",
"🟥"
];



const votes = {};

const voted = new Set();



options.forEach(
(_,i)=>{
votes[i]=0;
}
);



const buttons =

new ActionRowBuilder();



options.forEach(
(option,index)=>{


buttons.addComponents(

new ButtonBuilder()

.setCustomId(
`poll_${interaction.id}_${index}`
)

.setLabel(
`${emojis[index]} ${option}`
)

.setStyle(
ButtonStyle.Primary
)

);

});



buttons.addComponents(

new ButtonBuilder()

.setCustomId(
`poll_result_${interaction.id}`
)

.setLabel(
"📊 Risultati"
)

.setStyle(
ButtonStyle.Secondary
)

);



const embed =

new EmbedBuilder()

.setTitle(
"⚜️ ELEGANCE POLL"
)

.setDescription(

`## 📊 ${question}\n\n` +

options.map(
(o,i)=>
`${emojis[i]} **${o}** — 0 voti`
)
.join("\n")

+

`\n\n👥 Votanti: 0`

)

.setColor(
0x5865F2
)

.setFooter({

text:
`Creato da ${interaction.user.tag}`

})

.setTimestamp();



const message =

await interaction.reply({

embeds:[
embed
],

components:[
buttons
],

fetchReply:true

});



polls.set(
interaction.id,
{

message,
embed,
options,
votes,
voted

}

);


}

};
