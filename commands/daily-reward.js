const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const dailySystem = require("./dailySystem");



module.exports = {


    data: new SlashCommandBuilder()

        .setName("daily-reward")

        .setDescription(
            "Riscatta la ricompensa giornaliera"
        ),



    async execute(interaction) {


        const userId =
            interaction.user.id;



        const check =
            dailySystem.canClaim(userId);



        if(!check.available) {


            const embed =
                new EmbedBuilder()

                .setTitle(
                    "⏳ Daily Reward già riscattato"
                )

                .setDescription(

`
Hai già ricevuto la tua ricompensa!

Potrai riscattarla nuovamente tra:

⏰ **${dailySystem.formatTime(check.remaining)}**
`

                )

                .setColor("Orange");



            return interaction.reply({

                embeds:[embed],

                ephemeral:true

            });


        }





        const reward =
            dailySystem.claim(userId);





        const embed =
            new EmbedBuilder()

            .setTitle(
                "🎁 Daily Reward ricevuto!"
            )

            .setDescription(

`
Complimenti ${interaction.user}! 🎉

Hai ottenuto:

⭐ **+${reward.xp} XP**

🪙 **+${reward.coins} monete**

━━━━━━━━━━━━━━

⏰ Torna tra 24 ore per una nuova ricompensa!
`

            )

            .setColor("Gold");





        await interaction.reply({

            embeds:[embed]

        });


    }


};
