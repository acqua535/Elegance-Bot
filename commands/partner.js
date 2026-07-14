const {
    SlashCommandBuilder
} = require("discord.js");


const CHANNEL_ID = "1508774443286003815";
const LOG_ID = "1505261606483923105";


module.exports = {

data: new SlashCommandBuilder()

.setName("partner")

.setDescription("Crea una richiesta partnership")

.addUserOption(option =>
option
.setName("richiesta_da")
.setDescription("Utente che richiede la partnership")
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



const testo =

`━━━━━━━⚜️━━━━━━━

🤝 **NUOVA PARTNERSHIP**

👤 **Autore**
${interaction.user}

📌 **Richiesta da**
${richiesta}

🏷️ **Categoria**
${categoria}

📝 **Descrizione**
${descrizione}

━━━━━━━⚜️━━━━━━━`;



const channel =
interaction.guild.channels.cache.get(CHANNEL_ID);



if(!channel){

return interaction.reply({
content:"❌ Canale non trovato.",
ephemeral:true
});

}



await channel.send(testo);



const log =
interaction.guild.channels.cache.get(LOG_ID);



if(log){

log.send(

`📋 **LOG PARTNERSHIP**

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

content:"✅ Partnership inviata.",

ephemeral:true

});


}

};
