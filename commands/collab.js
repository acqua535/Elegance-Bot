const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const { addPoint } = require("../systems/leaderboardSystem");


const LOG_CHANNEL_ID = "1505261606483923105";
const COLLAB_CHANNEL_ID = "1522610038831845518";


const ALLOWED_ROLES = [
    "1505192718068879430",
    "1505192964769714287"
];


module.exports = {

    data: new SlashCommandBuilder()

        .setName("collab")
        .setDescription("Invia una collaborazione")

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione collaborazione")
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription("Manager collaborazione")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("data")
                .setDescription("Data della collaborazione")
                .setRequired(true)
        ),



    async execute(interaction) {


        const permission = interaction.member.roles.cache.some(
            role => ALLOWED_ROLES.includes(role.id)
        );


        if (!permission) {

            return interaction.reply({

                content: "❌ Non puoi usare questo comando.",

                ephemeral: true

            });

        }



        const channel =
            interaction.guild.channels.cache.get(COLLAB_CHANNEL_ID);



        if (!channel) {

            return interaction.reply({

                content: "❌ Canale Collab non trovato.",

                ephemeral: true

            });

        }



        const descrizione =
            interaction.options.getString("descrizione");


        const manager =
            interaction.options.getUser("manager");


        const data =
            interaction.options.getString("data");



        await channel.send({

            content: descrizione

        });



        await channel.send({

            content:
`————————🤝————————

Autore:
${interaction.user}

Manager:
${manager}

Data:
${data}`

        });



        addPoint(
            "collab",
            interaction.user.id
        );



        const logs =
            interaction.guild.channels.cache.get(LOG_CHANNEL_ID);



        if (logs) {

            await logs.send({

                embeds: [

                    new EmbedBuilder()

                        .setTitle("🤝 Collab creata")

                        .setDescription(
`Autore:
${interaction.user}

Manager:
${manager}

Canale:
${channel}`
                        )

                        .setTimestamp()

                ]

            });

        }



        await interaction.reply({

            content: "✅ Collaborazione inviata.",

            ephemeral: true

        });


    }

};
