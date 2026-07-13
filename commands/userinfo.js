const {
SlashCommandBuilder,
EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");


const FILE =
path.join(
__dirname,
"../users.json"
);



module.exports = {


data:

new SlashCommandBuilder()

.setName("userinfo")

.setDescription(
"Mostra informazioni complete di un utente"
)

.addUserOption(option =>

option

.setName("utente")

.setDescription(
"Utente da controllare"
)

.setRequired(false)

),



async execute(interaction){



const user =

interaction.options.getUser("utente")
||
interaction.user;



const member =

await interaction.guild.members
.fetch(user.id)
.catch(
()=>null
);



if(!member){

return interaction.reply({

content:
"❌ Utente non trovato.",

ephemeral:true

});

}



let users = [];



if(fs.existsSync(FILE)){

users =
JSON.parse(
fs.readFileSync(
FILE,
"utf8"
)
);

}



const data =

users.find(
u =>
u.id === user.id
);



const birthday =

data?.birthday
||
"Non impostato";



const messages =

data?.messages
||
0;



const lastMessage =

data?.lastMessage

?

`<t:${Math.floor(data.lastMessage / 1000)}:R>`

:

"Mai";



const roles =

member.roles.cache

.filter(
r =>
r.id !== interaction.guild.id
)

.sort(
(a,b)=>
b.position - a.position
)

.map(
r =>
r.toString()
)

.join("\n")
||

"Nessun ruolo";



const topRole =

member.roles.highest.id !== interaction.guild.id

?

member.roles.highest.toString()

:

"Nessun ruolo";



const joined =

member.joinedTimestamp

?

`<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`

:

"Non disponibile";



const created =

`<t:${Math.floor(user.createdTimestamp / 1000)}:D>`;



const embed =


new EmbedBuilder()

.setTitle(
"⚜️ USER INFO"
)

.setThumbnail(
user.displayAvatarURL({
dynamic:true
})
)


.addFields(


{
name:"👤 Utente",
value:`${user}`
},


{
name:"🆔 ID",
value:user.id
},


{
name:"📅 Account creato",
value:created
},


{
name:"📥 Entrato nel server",
value:joined
},


{
name:"⏳ Presente da",
value:
member.joinedTimestamp
?

`<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`

:

"Non disponibile"
},


{
name:"👑 Ruolo più alto",
value:topRole
},


{
name:"🎭 Ruoli",
value:
roles.substring(0,1024)
},


{
name:"🎂 Compleanno",
value:birthday
},


{
name:"💬 Messaggi",
value:
`${messages}`
},


{
name:"🕒 Ultimo messaggio",
value:
lastMessage
}


)


.setFooter({

text:
"⚜️ Elegance User System"

})


.setTimestamp();



await interaction.reply({

embeds:[
embed
]

});


}


};
