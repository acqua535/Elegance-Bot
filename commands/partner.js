const {
SlashCommandBuilder
} = require("discord.js");


const {
createRequest
} = require("./requestSystem");



module.exports = {


data:

new SlashCommandBuilder()

.setName("partner")

.setDescription(
"Crea una richiesta partnership"
)


.addStringOption(option=>

option

.setName("link")

.setDescription(
"Link invito server"
)

.setRequired(true)

)


.addUserOption(option=>

option

.setName("autore")

.setDescription(
"Autore della richiesta"
)

.setRequired(true)

)


.addStringOption(option=>

option

.setName("category")

.setDescription(
"Categoria server"
)

.setRequired(true)

.addChoices(

{
name:"🌐 Community",
value:"🌐 Community"
},

{
name:"🎮 Gaming",
value:"🎮 Gaming"
},

{
name:"🎭 Roleplay",
value:"🎭 Roleplay"
},

{
name:"🚗 FiveM",
value:"🚗 FiveM"
}

)

),



async execute(interaction){


await createRequest(

interaction,

"🤝 NUOVA PARTNERSHIP"

);


}


};
