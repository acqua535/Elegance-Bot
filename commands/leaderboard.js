const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { getLeaderboard } = require("../leaderboardSystem");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("leaderboard")

        .setDescription("Mostra la classifica")

        .addStringOption(option =>
            option
                .setName("tipo")
                .setDescription("Tipo classifica")
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

                content: "📊 Nessun dato disponibile.",

                ephemeral: true

            });

        }



        let testo = "";



        leaderboard.forEach(
            ([userId, punti], index) => {

                testo +=
`${index + 1}. <@${userId}> — **${punti}** punti\n`;

            }
        );



        const embed = new EmbedBuilder()

            .setTitle(`🏆 Leaderboard ${tipo}`)

            .setDescription(testo)

            .setTimestamp();



        await interaction.reply({

            embeds: [embed]

        });

    }

};
