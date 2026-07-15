const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const horrorEngine = require("../horrorEngine");

const horrorSystem = require("../horrorSystem");



module.exports = {



data:

new SlashCommandBuilder()

.setName("horror")

.setDescription(
    "Avvia una storia horror interattiva"
),





async execute(interaction){



    const stories = horrorEngine.getStories();



    const buttons = new ActionRowBuilder();



    stories.forEach(story => {


        buttons.addComponents(

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


    });





    const inventoryButton =

    new ButtonBuilder()

    .setCustomId(
        "horror_inventory"
    )

    .setLabel(
        "🎒 Inventario"
    )

    .setStyle(
        ButtonStyle.Secondary
    );





    const row2 =

    new ActionRowBuilder()

    .addComponents(

        inventoryButton

    );






    const embed =

    new EmbedBuilder()

    .setTitle(
        "👻 Horror Adventure"
    )

    .setDescription(

`
Benvenuto in **Horror Adventure**.

Scegli una storia.

Ogni scelta può cambiare il tuo destino...

☠️ Attenzione:
alcuni percorsi possono portare alla morte.
`

    )

    .setColor("DarkRed");






    await interaction.reply({

        embeds:[

            embed

        ],

        components:[

            buttons,

            row2

        ]

    });



}


};
