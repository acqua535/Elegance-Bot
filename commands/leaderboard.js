const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const {
    getLeaderboard
} = require("../systems/leaderboardSystem");



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
                        name: "⚜️ Sponsor",
                        value: "sponsor"
                    },

                    {
                        name: "🌐 Collab",
                        value: "collab"
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

            sponsor: "⚜️ Sponsor",

            collab: "🌐 Collab"

        };



        let text = "";



        if (leaderboard.length === 0) {

            text = "Nessun dato disponibile.";

        } else {


            leaderboard.forEach((user, index) => {

                text +=
`**${index + 1}.** <@${user[0]}> — ${user[1]} punti\n`;

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
