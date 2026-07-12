const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const CHANNEL_ID = "1508774443286003815";
const LOG_CHANNEL_ID = "1505261606483923105";


const STAFF_ROLES = [
    "1505192964769714287",
    "1505192718068879430"
];


module.exports = {

    data: new SlashCommandBuilder()

        .setName("partner")
        .setDescription("Crea una partnership")

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione partnership")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("link")
                .setDescription("Link server/social")
                .setRequired(true)
        ),



    async execute(interaction) {


        const permission =
            interaction.member.roles.cache.some(
                role => STAFF_ROLES.includes(role.id)
            );


        if (!permission) {

            return interaction.reply({

                content: "❌ Non hai il permesso.",

                ephemeral: true

            });

        }



        const channel =
            interaction.guild.channels.cache.get(
                CHANNEL_ID
            );


        const descrizione =
            interaction.options.getString("descrizione");


        const link =
            interaction.options.getString("link");



        const embed = new EmbedBuilder()

            .setTitle("🤝 Nuova Partnership")

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

            await logs.send(
                `🤝 Partnership creata da ${interaction.user}`
            );

        }



        await interaction.reply({

            content:
            "✅ Partnership pubblicata.",

            ephemeral: true

        });


    }

};
