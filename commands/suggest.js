const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const SUGGEST_CHANNEL_ID = "1526006559736463420";


module.exports = {


    data: new SlashCommandBuilder()

        .setName("suggest")

        .setDescription(
            "Invia un suggerimento per Elegance Sponsoring"
        )

        .addStringOption(option =>

            option

                .setName("idea")

                .setDescription(
                    "Il tuo suggerimento"
                )

                .setRequired(true)

        ),



    async execute(interaction) {


        const idea =
            interaction.options.getString(
                "idea"
            );


        const channel =
            interaction.guild.channels.cache.get(
                SUGGEST_CHANNEL_ID
            );



        if (!channel) {


            return interaction.reply({

                content:
                    "❌ Canale suggerimenti non trovato.",

                ephemeral: true

            });


        }



        const embed =
            new EmbedBuilder()

                .setTitle(
                    "💡 Nuovo Suggerimento"
                )

                .setDescription(
                    idea
                )

                .addFields(

                    {
                        name: "👤 Autore",
                        value:
                            `${interaction.user}`
                    },

                    {
                        name: "📅 Data",
                        value:
                            `<t:${Math.floor(Date.now()/1000)}:F>`
                    }

                )

                .setFooter({

                    text:
                    "Elegance Sponsoring"

                });



        const message =
            await channel.send({

                embeds: [
                    embed
                ]

            });



        await message.react("👍");

        await message.react("👎");



        await interaction.reply({

            content:
                "✅ Suggerimento inviato correttamente!",

            ephemeral: true

        });


    }


};
