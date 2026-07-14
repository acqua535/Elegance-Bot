const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const gameSystem = require("./gameSystem");
const dailySystem = require("./dailySystem");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("rewards")

        .setDescription(
            "Visualizza tutte le ricompense disponibili"
        ),



    async execute(interaction) {


        const userId =
        interaction.user.id;



        const profile =
        gameSystem.getProfile(userId);



        const daily =
        dailySystem.canClaim(userId);



        const dailyStatus =
        daily.available

        ? "🟢 Disponibile"

        : "🔴 Riscattata";




        const streak =
        profile.streak || 0;



        const nextStreak =
        3 - (streak % 3);




        const embed =
        new EmbedBuilder()


        .setTitle(
            "🎁 Rewards Hub"
        )


        .setDescription(

`
Benvenuto ${interaction.user}!

Qui puoi controllare tutte le ricompense disponibili.

━━━━━━━━━━━━━━━━

🎁 **Daily Reward**

${dailyStatus}

Ricompensa giornaliera ogni 24 ore.


━━━━━━━━━━━━━━━━

🔥 **Streak Rewards**

Streak attuale:
**${streak} vittorie consecutive**

Prossima ricompensa:
**${nextStreak} vittorie**

Ricompensa ogni 3 streak.


━━━━━━━━━━━━━━━━

🏆 **Achievement Reward**

Gli achievement vengono sbloccati automaticamente.

Esempi:

⚔️ 5 vittorie consecutive
👑 10 vittorie consecutive
🎮 Primo gioco
🪙 Ricchezza


━━━━━━━━━━━━━━━━

🎲 **Special Reward**

Continua a giocare per ottenere:

⭐ XP

🪙 Monete

🎁 Oggetti esclusivi

━━━━━━━━━━━━━━━━
`

        )


        .setColor("Gold")

        .setThumbnail(
            interaction.user.displayAvatarURL({
                dynamic:true
            })
        )

        .setTimestamp();





        const row =
        new ActionRowBuilder()

        .addComponents(


            new ButtonBuilder()

            .setCustomId(
                "claim_daily"
            )

            .setLabel(
                "🎁 Daily Reward"
            )

            .setStyle(
                ButtonStyle.Success
            ),



            new ButtonBuilder()

            .setCustomId(
                "view_profile"
            )

            .setLabel(
                "👤 Profilo"
            )

            .setStyle(
                ButtonStyle.Secondary
            )


        );





        await interaction.reply({

            embeds:[
                embed
            ],

            components:[
                row
            ]

        });



    }


};
