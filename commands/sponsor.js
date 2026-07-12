const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const LOG_CHANNEL_ID = "1505261606483923105";
const SPONSOR_CHANNEL_ID = "1521856540016115803";


const ALLOWED_ROLES = [
    "1505192718068879430",
    "1505192964769714287"
];


module.exports = {

    data: new SlashCommandBuilder()

        .setName("sponsor")
        .setDescription("Invia uno sponsor")

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione sponsor")
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("ping")
                .setDescription("Ruolo da pingare")
                .setRequired(false)
        )

        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription("Manager sponsor")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("data")
                .setDescription("Data opzionale")
                .setRequired(false)
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
            interaction.guild.channels.cache.get(SPONSOR_CHANNEL_ID);



        if (!channel) {

            return interaction.reply({

                content: "❌ Canale Sponsor non trovato.",

                ephemeral: true

            });

        }



        const descrizione =
            interaction.options.getString("descrizione");


        const ping =
            interaction.options.getRole("ping");


        const manager =
            interaction.options.getUser("manager");


        const data =
            interaction.options.getString("data");



        await channel.send({

            content: descrizione

        });



        await channel.send({

            content:
`————————⚜️————————

Autore:
${interaction.user}

${manager ? `Manager:
${manager}

` : ""}${ping ? `Ping:
${ping}

` : ""}${data ? `Data:
${data}` : ""}`

        });



        const logs =
            interaction.guild.channels.cache.get(LOG_CHANNEL_ID);



        if (logs) {

            await logs.send({

                embeds: [

                    new EmbedBuilder()

                        .setTitle("⚜️ Sponsor creato")

                        .setDescription(
`Autore: ${interaction.user}

Canale:
${channel}`
                        )

                        .setTimestamp()

                ]

            });

        }



        await interaction.reply({

            content: "✅ Sponsor inviato.",

            ephemeral: true

        });

    }

};
