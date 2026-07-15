const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const horrorEngine = require("../horrorEngine");

const stories = require("../horrorStories");



module.exports = {


data:

new SlashCommandBuilder()

.setName("horror")

.setDescription(
    "Avvia una storia horror interattiva"
),





async execute(interaction){



    const rows = [];

    let row = new ActionRowBuilder();

    let count = 0;



    for(const story of stories){



        row.addComponents(

            new ButtonBuilder()

            .setCustomId(
                `horror_start_${story.id}`
            )

            .setLabel(
                story.title
            )

            .setStyle(
                ButtonStyle.Danger
            )

        );



        count++;



        if(count === 5){

            rows.push(row);

            row = new ActionRowBuilder();

            count = 0;

        }



    }



    if(count > 0){

        rows.push(row);

    }






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
                ButtonStyle.Secondary
            )

        )

    );







    const embed = new EmbedBuilder()

    .setTitle(
        "👻 Horror Adventure"
    )

    .setDescription(

`
Benvenuto in **Horror Adventure**.

Scegli una delle storie disponibili.

⚠️ Ogni scelta può cambiare il finale.
`

    )

    .setColor("DarkRed");







    await interaction.reply({

        embeds:[embed],

        components:rows

    });



}


};
