const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getLeaderboard
} = require("../leaderboards/leaderboardSystem");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("leaderboards")
        .setDescription("Mostra la classifica")

        .addStringOption(option =>
            option
                .setName("tipo")
                .setDescription("Tipo di classifica")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Partner",
                        value: "partner"
                    },
                    {
                        name: "Sponsor",
                        value: "sponsor"
                    },
                    {
                        name: "Collab",
                        value: "collab"
                    }
                )
        ),


    async execute(interaction) {


        const tipo =
            interaction.options.getString("tipo");


        const leaderboard =
            getLeaderboard(tipo);



        if (leaderboard.length === 0) {

            return interaction.reply({

                content: "📊 Nessun dato disponibile per questa classifica.",

                ephemeral: true

            });

        }



        let classifica = "";


        leaderboard.forEach(
            ([userId, punti], index) => {

                classifica +=
`${index + 1}. <@${userId}> — **${punti} punti**\n`;

            }
        );



        const embed = new EmbedBuilder()

            .setTitle(`🏆 Leaderboards • ${tipo}`)

            .setDescription(classifica)

            .setTimestamp();



        await interaction.reply({

            embeds: [embed]

        });

    }

};
