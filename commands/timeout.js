const {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} = require("discord.js");


const SUPREME_ROLE = "1505192718068879430";
const LOG_CHANNEL = "1505261606483923105";


module.exports = {


data:new SlashCommandBuilder()

.setName("timeout")

.setDescription("Metti in timeout un membro")

.addUserOption(option=>

option
.setName("utente")
.setDescription("Utente")
.setRequired(true)

)

.addIntegerOption(option=>

option
.setName("durata")
.setDescription("Durata in minuti")
.setRequired(true)

)

.addStringOption(option=>

option
.setName("motivo")
.setDescription("Motivo")
.setRequired(true)

),



async execute(interaction){



const user =
interaction.options.getMember("utente");


const durata =
interaction.options.getInteger("durata");


const motivo =
interaction.options.getString("motivo");



if(
!interaction.member.roles.cache.has(SUPREME_ROLE) &&
!interaction.member.permissions.has(
PermissionFlagsBits.ModerateMembers
)
){

return interaction.reply({

content:"❌ Non hai i permessi.",

ephemeral:true

});

}



if(durata > 40320){

return interaction.reply({

content:"❌ Massimo consentito: 28 giorni.",

ephemeral:true

});

}



await user.timeout(

durata * 60 * 1000,

motivo

);



const embed =
new EmbedBuilder()

.setTitle("🔇 TIMEOUT")

.addFields(

{
name:"👤 Staff",
value:`${interaction.user}`
},

{
name:"🎯 Utente",
value:`${user.user.tag}`
},

{
name:"⏱️ Durata",
value:`${durata} minuti`
},

{
name:"📝 Motivo",
value:motivo
}

)

.setTimestamp();



const log =
interaction.guild.channels.cache.get(
LOG_CHANNEL
);


if(log)
log.send({
embeds:[embed]
});



interaction.reply({

content:"✅ Timeout applicato.",

ephemeral:true

});


}

};
