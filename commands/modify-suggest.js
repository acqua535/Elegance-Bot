const {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} = require("discord.js");


module.exports = {


data:new SlashCommandBuilder()

.setName("modify-suggest")

.setDescription("Modifica lo stato di un suggerimento")

.setDefaultMemberPermissions(
PermissionFlagsBits.ManageMessages
)


.addStringOption(option =>

option

.setName("link")

.setDescription(
"Link del messaggio Discord"
)

.setRequired(true)

)


.addStringOption(option =>

option

.setName("stato")

.setDescription(
"Nuovo stato"
)

.setRequired(true)

.addChoices(

{
name:"🟡 In valutazione",
value:"🟡 In valutazione"
},

{
name:"🟢 Accettato",
value:"🟢 Accettato"
},

{
name:"🔴 Rifiutato",
value:"🔴 Rifiutato"
}

)

),



async execute(interaction){


const link =
interaction.options.getString("link");


const stato =
interaction.options.getString("stato");



const ids =
link.split("/");



const channelId =
ids[5];


const messageId =
ids[6];



const channel =
await interaction.guild.channels.fetch(
channelId
);



const message =
await channel.messages.fetch(
messageId
);



if(!message.embeds.length){

return interaction.reply({

content:
"❌ Questo messaggio non contiene un suggerimento.",

ephemeral:true

});

}



const embed =
EmbedBuilder.from(
message.embeds[0]
);



const fields =
embed.data.fields || [];



const newFields =
fields.filter(
field =>
field.name !== "📊 Stato"
);



newFields.push({

name:"📊 Stato",

value:stato,

inline:true

});



embed.setFields(newFields);



await message.edit({

embeds:[
embed
]

});



await interaction.reply({

content:
"✅ Stato aggiornato!",

ephemeral:true

});


}

};
