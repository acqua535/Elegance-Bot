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



function loadUsers(){

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



module.exports = {


data:

new SlashCommandBuilder()

.setName("userinfo")

.setDescription(
"Mostra informazioni di un utente"
)

.addUserOption(option =>

option

.setName("utente")

.setDescription(
"Utente da visualizzare"
)

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
)
.catch(
()=>null
);



if(!member){

return interaction.reply({

content:
"❌ Utente non trovato nel server.",

ephemeral:true

});

}




const users =
loadUsers();



const userData =

users.find(

u =>
u.id === user.id

);




const birthday =

userData?.birthday
||
"Non impostato";




const roles =

member.roles.cache

.filter(

role =>
role.id !== interaction.guild.id

)

.map(

role =>
role.toString()

)

.join(" ")
||
"Nessun ruolo";




const accountCreated =

`<t:${Math.floor(
user.createdTimestamp / 1000
)}:D>`;



const joinedServer =

member.joinedTimestamp

?

`<t:${Math.floor(
member.joinedTimestamp / 1000
)}:D>`

:

"Non disponibile";



const joinedRelative =

member.joinedTimestamp

?

`<t:${Math.floor(
member.joinedTimestamp / 1000
)}:R>`

:

"Non disponibile";





const embed =

new EmbedBuilder()

.setTitle(
"⚜️ USER INFO"
)

.setThumbnail(
user.displayAvatarURL({
dynamic:true,
size:1024
})
)

.addFields(

{
name:
"👤 Utente",
value:
`${user}`,
inline:true
},


{
name:
"🆔 ID",
value:
user.id,
inline:true
},


{
name:
"🤖 Tipo",
value:
user.bot
?
"Bot"
:
"Utente",
inline:true
},


{
name:
"📅 Account creato",
value:
accountCreated,
inline:false
},


{
name:
"📥 Entrato nel server",
value:
joinedServer,
inline:false
},


{
name:
"⏳ Presente da",
value:
joinedRelative,
inline:false
},


{
name:
"🎭 Ruoli",
value:
roles.substring(0,1024),
inline:false
},


{
name:
"🎂 Compleanno",
value:
birthday,
inline:false
}

)

.setColor(
0x5865F2
)

.setFooter({

text:
"⚜️ Elegance Sponsoring"

})

.setTimestamp();



await interaction.reply({

embeds:[
embed
]

});


}


};
