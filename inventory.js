const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const gameSystem = require("./gameSystem");



module.exports = {


    data: new SlashCommandBuilder()

        .setName("inventory")

        .setDescription(
            "Mostra il tuo profilo gaming, inventario e ricompense"
        ),



    async execute(interaction) {


        const userId =
        interaction.user.id;



        const profile =
        gameSystem.getProfile(userId);



        const items =
        profile.inventory &&
        profile.inventory.length > 0

        ?

        profile.inventory.join("\n")

        :

        "🎁 Nessun oggetto ottenuto";





        const achievements =

        profile.achievements &&
        profile.achievements.length > 0

        ?

        profile.achievements
        .map(
            a => `🏆 ${a}`
        )
        .join("\n")

        :

        "🔒 Nessun achievement sbloccato";






        const embed =

        new EmbedBuilder()



        .setTitle(
            `🎒 Inventario di ${interaction.user.username}`
        )



        .setThumbnail(

            interaction.user.displayAvatarURL({

                dynamic:true

            })

        )



        .setDescription(

`
━━━━━━━━━━━━━━━━━━

🪙 **Monete**

${profile.coins || 0}


━━━━━━━━━━━━━━━━━━

🎁 **Oggetti**

${items}


━━━━━━━━━━━━━━━━━━

🏆 **Achievement**

${achievements}


━━━━━━━━━━━━━━━━━━

🎮 **Statistiche Gaming**

🎲 Partite:
${profile.games || 0}

🏆 Vittorie:
${profile.wins || 0}

❌ Sconfitte:
${profile.losses || 0}


━━━━━━━━━━━━━━━━━━

🔥 **Streak**

Attuale:
${profile.streak || 0}

Record:
${profile.bestStreak || 0}


━━━━━━━━━━━━━━━━━━

Continua a giocare per ottenere nuove ricompense! ⚜️
`

        )



        .setColor("Gold");





        await interaction.reply({

            embeds:[
                embed
            ]

        });


    }


};
