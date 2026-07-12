const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const SPONSOR_CHANNEL_ID = "1521856540016115803";
const LOG_CHANNEL_ID = "1505261606483923105";


const STAFF_ROLES = [
    "1505192964769714287",
    "1505192718068879430"
];


module.exports = {

    data: new SlashCommandBuilder()

        .setName("sponsor")

        .setDescription("Crea uno sponsor")

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione sponsor")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("link")
                .setDescription("Link sponsor")
                .setRequired(true)
        ),



    async execute(interaction) {


        const hasPermission =
            interaction.member.roles.cache.some(
                role => STAFF_ROLES.includes(role.id)
            );


        if (!hasPermission) {

            return interaction.reply({

                content:
                "❌ Non hai il permesso di usare questo comando.",

                ephemeral: true

            });

        }



        const channel =
            interaction.guild.channels.cache.get(
                SPONSOR_CHANNEL_ID
            );


        if (!channel) {

            return interaction.reply({

                content:
                "❌ Canale sponsor non trovato.",

                ephemeral: true

            });

        }



        const descrizione =
            interaction.options.getString("descrizione");


        const link =
            interaction.options.getString("link");



        const embed = new EmbedBuilder()

            .setTitle("⚜️ Nuovo Sponsor")

            .setDescription(
`
${descrizione}

🔗 Link:
${link}

👤 Creato da:
${interaction.user}
`
            )

            .setTimestamp();



        await channel.send({

            embeds: [embed]

        });



        const logs =
            interaction.guild.channels.cache.get(
                LOG_CHANNEL_ID
            );


        if (logs) {

            await logs.send({

                content:
                `⚜️ Sponsor creato da ${interaction.user}`

            });

        }



        await interaction.reply({

            content:
            "✅ Sponsor pubblicato.",

            ephemeral: true

        });


    }

};
