const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


const SUPREME_ROLE = "1505192718068879430";
const LOG_CHANNEL = "1505261606483923105";


module.exports = {

data: new SlashCommandBuilder()

.setName("kick")

.setDescription("Espelle un membro dal server")

.addUserOption(option =>
    option
    .setName("utente")
    .setDescription("Utente da espellere")
    .setRequired(true)
)

.addStringOption(option =>
    option
    .setName("motivo")
    .setDescription("Motivo del kick")
    .setRequired(true)
),



async execute(interaction){


const user =
interaction.options.getMember("utente");

const motivo =
interaction.options.getString("motivo");



if(
!interaction.member.roles.cache.has(SUPREME_ROLE) &&
!interaction.member.permissions.has(
PermissionFlagsBits.KickMembers
)
){

return interaction.reply({

content:"❌ Non hai i permessi per usare questo comando.",

ephemeral:true

});

}



if(!user){

return interaction.reply({

content:"❌ Utente non trovato.",

ephemeral:true

});

}



await user.kick(motivo);



const embed =
new EmbedBuilder()

.setTitle("👢 KICK")

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
name:"📝 Motivo",
value:motivo
}

)

.setTimestamp()

.setFooter({
text:"⚜️ Elegance Moderation"
});



const log =
interaction.guild.channels.cache.get(
LOG_CHANNEL
);


if(log)
log.send({
embeds:[embed]
});



interaction.reply({

content:"✅ Utente espulso.",

ephemeral:true

});


}

};
