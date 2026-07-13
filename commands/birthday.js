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


data: new SlashCommandBuilder()

.setName("birthday")

.setDescription("Imposta il tuo compleanno")

.addIntegerOption(option =>
    option
    .setName("giorno")
    .setDescription("Giorno del compleanno")
    .setRequired(true)
)

.addIntegerOption(option =>
    option
    .setName("mese")
    .setDescription("Mese del compleanno")
    .setRequired(true)
),



async execute(interaction){


let users =
JSON.parse(
    fs.readFileSync(FILE, "utf8")
);



const giorno =
interaction.options.getInteger("giorno");


const mese =
interaction.options.getInteger("mese");



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



let user =
users.find(
    u => u.id === interaction.user.id
);



if(!user){

user = {

id: interaction.user.id,

birthday: null

};


users.push(user);

}



user.birthday =
`${giorno}/${mese}`;



fs.writeFileSync(

FILE,

JSON.stringify(
users,
null,
2
)

);



const embed =
new EmbedBuilder()

.setTitle(
"🎂 Compleanno salvato"
)

.setDescription(

`Il tuo compleanno è stato impostato a **${giorno}/${mese}**.`

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
