const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const gameSystem = require("./gameSystem");



module.exports = {


    data: new SlashCommandBuilder()

        .setName("game-profile")

        .setDescription(
            "Mostra il tuo profilo gaming"
        ),



    async execute(interaction) {


        const userId =
            interaction.user.id;



        const profile =
            gameSystem.getProfile(userId);



        const embed =
            new EmbedBuilder()

            .setTitle(
                `🎮 Profilo Gaming di ${interaction.user.username}`
            )

            .setThumbnail(
                interaction.user.displayAvatarURL({
                    dynamic: true
                })
            )

            .setDescription(

`
━━━━━━━━━━━━━━━━

⭐ **Livello**
${profile.level || 1}

✨ **XP**
${profile.xp || 0}

🪙 **Monete**
${profile.coins || 0}

━━━━━━━━━━━━━━━━

🎮 **Minigame giocati**
${profile.games || 0}

🏆 **Vittorie**
${profile.wins || 0}

❌ **Sconfitte**
${profile.losses || 0}

━━━━━━━━━━━━━━━━

Continua a giocare per migliorare il tuo profilo! 🎮
`

            )

            .setColor("Gold");



        await interaction.reply({

            embeds: [
                embed
            ]

        });


    }


};
