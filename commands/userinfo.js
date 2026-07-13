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


data:new SlashCommandBuilder()

.setName("userinfo")

.setDescription("Mostra informazioni di un utente")

.addUserOption(option =>

option

.setName("utente")

.setDescription("Utente da vedere")

.setRequired(false)

),



async execute(interaction){



const user =
interaction.options.getUser("utente")
||
interaction.user;



const member =
await interaction.guild.members.fetch(
user.id
);



let users =
JSON.parse(
fs.readFileSync(FILE,"utf8")
);



let data =
users.find(
u=>u.id===user.id
);



const birthday =
data?.birthday
||
"Non impostato";



const roles =
member.roles.cache

.filter(r=>r.id!==interaction.guild.id)

.map(r=>r.toString())

.join(" ")
||
"Nessun ruolo";



const embed =
new EmbedBuilder()

.setTitle("⚜️ USER INFO")

.setThumbnail(
user.displayAvatarURL()
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
value:`<t:${Math.floor(user.createdTimestamp/1000)}:D>`
},

{
name:"📥 Entrato nel server",
value:`<t:${Math.floor(member.joinedTimestamp/1000)}:D>`
},

{
name:"🎂 Compleanno",
value:birthday
},

{
name:"🎭 Ruoli",
value:roles.substring(0,1024)
}

)

.setTimestamp();



interaction.reply({

embeds:[embed]

});


}

};
