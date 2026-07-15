const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const stories = require("./horrorStories");





module.exports = {



    data:

    new SlashCommandBuilder()

    .setName("horror")

    .setDescription(
        "Avvia una storia horror interattiva"
    ),







    async execute(interaction){



        if(
            !stories ||
            stories.length === 0
        ){


            return interaction.reply({

                content:

                "❌ Nessuna storia horror disponibile.",

                ephemeral:true

            });


        }







        const rows = [];

        let row =
        new ActionRowBuilder();

        let count = 0;







        for(const story of stories){



            row.addComponents(


                new ButtonBuilder()

                .setCustomId(

                    `horror_start_${story.id}`

                )


                .setLabel(

                    story.title.substring(0,80)

                )


                .setStyle(

                    ButtonStyle.Danger

                )


            );





            count++;







            if(count === 5){



                rows.push(row);



                row =
                new ActionRowBuilder();



                count = 0;



            }



        }









        if(count > 0){



            rows.push(row);



        }









        // INVENTARIO

        rows.push(


            new ActionRowBuilder()

            .addComponents(


                new ButtonBuilder()

                .setCustomId(

                    "horror_inventory"

                )


                .setLabel(

                    "🎒 Inventario"

                )


                .setStyle(

                    ButtonStyle.Primary

                )


            )


        );









        const embed =


        new EmbedBuilder()


        .setTitle(

            "👻 Horror Adventure"

        )


        .setDescription(

`
Benvenuto in **Horror Adventure**.

Scegli una storia e prova a sopravvivere.

⚠️ Ogni scelta può cambiare completamente il finale.
`

        )


        .setColor(

            "DarkRed"

        )


        .setTimestamp();









        await interaction.reply({


            embeds:[embed],


            components:rows


        });





    }



};
