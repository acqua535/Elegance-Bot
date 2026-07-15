const {
    SlashCommandBuilder
} = require("discord.js");


const CHANNEL_ID = "1521856540016115803";
const LOG_ID = "1505261606483923105";


module.exports = {

data: new SlashCommandBuilder()

.setName("sponsor")

.setDescription("Crea una richiesta sponsorizzazione")

.addUserOption(option =>
option
.setName("richiesta_da")
.setDescription("Utente che richiede la sponsorizzazione")
.setRequired(true)
)

.addStringOption(option =>
option
.setName("categoria")
.setDescription("Categoria")
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
)

.addStringOption(option =>
option
.setName("descrizione")
.setDescription("Descrizione richiesta")
.setRequired(true)
),



async execute(interaction){


const richiesta =
interaction.options.getUser("richiesta_da");


const categoria =
interaction.options.getString("categoria");


const descrizione =
interaction.options.getString("descrizione");



const primoMessaggio =

`━━━━━━━⚜️━━━━━━━

⭐ **NUOVA SPONSORIZZAZIONE**

📝 **Descrizione**
${descrizione}

━━━━━━━⚜️━━━━━━━`;





const secondoMessaggio =

`━━━━━━━⚜️━━━━━━━

👤 **Autore**
${interaction.user}

📌 **Richiesta da**
${richiesta}

🏷️ **Categoria**
${categoria}

━━━━━━━⚜️━━━━━━━`;





const channel =
interaction.guild.channels.cache.get(CHANNEL_ID);



if(!channel){

return interaction.reply({

content:"❌ Canale sponsor non trovato.",

ephemeral:true

});

}



await channel.send(primoMessaggio);


await channel.send(secondoMessaggio);



const log =
interaction.guild.channels.cache.get(LOG_ID);



if(log){

log.send(

`📋 **LOG SPONSORIZZAZIONE**

👤 Autore:
${interaction.user}

📌 Richiesta da:
${richiesta}

🏷️ Categoria:
${categoria}

📝 Descrizione:
${descrizione}

⏰ <t:${Math.floor(Date.now()/1000)}:F>`

);

}



interaction.reply({

content:"✅ Sponsorizzazione inviata.",

ephemeral:true

});


}

};
