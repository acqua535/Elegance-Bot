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



function saveUsers(users){

    fs.writeFileSync(

        FILE,

        JSON.stringify(
            users,
            null,
            2
        )

    );

}




module.exports = {


data:

new SlashCommandBuilder()

.setName("birthday")

.setDescription(
"Imposta il tuo compleanno"
)

.addIntegerOption(option =>

option

.setName("giorno")

.setDescription(
"Giorno del compleanno"
)

.setRequired(true)

)


.addIntegerOption(option =>

option

.setName("mese")

.setDescription(
"Mese del compleanno"
)

.setRequired(true)

),





async execute(interaction){



const giorno =

interaction.options.getInteger(
"giorno"
);



const mese =

interaction.options.getInteger(
"mese"
);



if(
giorno < 1 ||
giorno > 31 ||
mese < 1 ||
mese > 12
){

return interaction.reply({

content:
"❌ Data non valida.",

ephemeral:true

});

}



const users =
loadUsers();



let user =

users.find(

u =>
u.id === interaction.user.id

);



if(!user){


user = {

id:
interaction.user.id,

birthday:
null

};


users.push(user);


}



user.birthday =
`${giorno}/${mese}`;



saveUsers(
users
);



const embed =

new EmbedBuilder()

.setTitle(
"🎂 Compleanno impostato"
)

.setDescription(

`Il tuo compleanno è stato salvato: **${giorno}/${mese}**`

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
],

ephemeral:true

});



}


};
