const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const {
    getLeaderboard
} = require("../leaderboardSystem");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("leaderboard")

        .setDescription("Mostra le classifiche Elegance")

        .addStringOption(option =>
            option
                .setName("tipo")
                .setDescription("Tipo di classifica")
                .setRequired(true)

                .addChoices(

                    {
                        name: "🤝 Partner",
                        value: "partner"
                    },

                    {
                        name: "🌐 Collab",
                        value: "collab"
                    },

                    {
                        name: "⚜️ Sponsor",
                        value: "sponsor"
                    }

                )
        ),



    async execute(interaction) {


        const type =
            interaction.options.getString("tipo");



        const leaderboard =
            getLeaderboard(type);



        const names = {

            partner: "🤝 Partner",

            collab: "🌐 Collab",

            sponsor: "⚜️ Sponsor"

        };



        let text = "";



        if (leaderboard.length === 0) {

            text = "📭 Nessun dato disponibile.";

        } else {


            leaderboard.forEach((entry, index) => {


                const userId = entry[0];

                const points = entry[1];


                let medal = "🏅";


                if (index === 0) medal = "🥇";

                if (index === 1) medal = "🥈";

                if (index === 2) medal = "🥉";


                text +=
`${medal} **${index + 1}.** <@${userId}> — **${points} punti**
`;

            });

        }



        const embed = new EmbedBuilder()

            .setTitle(`🏆 ${names[type]} Leaderboard`)

            .setDescription(text)

            .setTimestamp();



        await interaction.reply({

            embeds: [embed]

        });


    }

};
