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
"Utente da controllare"
)

.setRequired(false)

),





async execute(interaction){



const user =

interaction.options.getUser(
"utente"
)
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

.join("\n")
||
"Nessun ruolo";







const created =

`<t:${Math.floor(
user.createdTimestamp / 1000
)}:D>`;





const joined =

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
`${user}`

},



{

name:
"🆔 ID",

value:
user.id

},



{

name:
"🤖 Tipo",

value:
user.bot
?
"Bot"
:
"Utente"

},



{

name:
"📅 Account creato",

value:
created

},



{

name:
"📥 Entrato nel server",

value:
joined

},



{

name:
"⏳ Nel server da",

value:
joinedRelative

},



{

name:
"🎭 Ruoli",

value:
roles.substring(
0,
1024
)

},



{

name:
"🎂 Compleanno",

value:
birthday

}



)



.setColor(
0x5865F2
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
