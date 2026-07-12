const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const { addPoint } = require("./systems/leaderboardSystem");


const LOG_CHANNEL_ID = "1505261606483923105";
const PARTNER_CHANNEL_ID = "1508774443286003815";


const ALLOWED_ROLES = [
    "1505192718068879430",
    "1505192964769714287"
];


module.exports = {

    data: new SlashCommandBuilder()

        .setName("partner")
        .setDescription("Invia una partnership")

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione partnership")
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription("Manager partnership")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("data")
                .setDescription("Data partnership")
                .setRequired(true)
        ),


    async execute(interaction) {


        const permission =
            interaction.member.roles.cache.some(
                role => ALLOWED_ROLES.includes(role.id)
            );


        if (!permission) {

            return interaction.reply({
                content: "❌ Non puoi usare questo comando.",
                ephemeral: true
            });

        }


        const channel =
            interaction.guild.channels.cache.get(
                PARTNER_CHANNEL_ID
            );


        if (!channel) {

            return interaction.reply({
                content: "❌ Canale Partner non trovato.",
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
            "partner",
            interaction.user.id
        );



        const logs =
            interaction.guild.channels.cache.get(
                LOG_CHANNEL_ID
            );


        if (logs) {

            await logs.send({

                embeds: [

                    new EmbedBuilder()

                        .setTitle("🤝 Partner creato")

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

            content: "✅ Partnership inviata.",

            ephemeral: true

        });

    }

};
