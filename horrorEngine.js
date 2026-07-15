const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const stories = require("./horrorStories");
const horrorSystem = require("./horrorSystem");



// ======================================
// PLAYER CACHE
// ======================================

const activePlayers = new Map();



// ======================================
// GET PLAYER
// ======================================

function getPlayer(userId){


    if(activePlayers.has(userId)){

        return activePlayers.get(userId);

    }



    const player =
    horrorSystem.getPlayer(userId);



    activePlayers.set(

        userId,

        player

    );



    return player;


}




// ======================================
// START STORY
// ======================================

async function startStory(
    interaction,
    storyId
){



    const story =
    stories.find(

        s => s.id === storyId

    );



    if(!story){


        return interaction.reply({

            content:
            "❌ Storia non trovata.",

            ephemeral:true

        });


    }





    const player =
    getPlayer(

        interaction.user.id

    );



    player.story =
    story.id;



    player.scene =
    story.start;



    player.gameOver =
    false;



    await renderScene(

        interaction,

        player

    );


}





// ======================================
// GET STORY
// ======================================

function getStory(player){


    return stories.find(

        s => s.id === player.story

    );


}





// ======================================
// GET NODE
// ======================================

function getNode(player){


    const story =
    getStory(player);



    if(!story)
        return null;



    return story.nodes[

        player.scene

    ];



}





// ======================================
// INVENTORY EMBED
// ======================================

function inventoryEmbed(player){


    const items =

    player.inventory.length > 0

    ?

    player.inventory.join("\n")

    :

    "🎒 Inventario vuoto.";



    return new EmbedBuilder()

    .setTitle(

        "🎒 Inventario"

    )

    .setDescription(

        items

    )

    .setColor(

        "DarkBlue"

    );



}





// ======================================
// CREATE BUTTONS
// ======================================

function createButtons(node){



    const rows = [];



    let row =
    new ActionRowBuilder();



    let count = 0;





    if(node.choices){



        for(const choice of node.choices){



            if(count >= 5){



                rows.push(row);



                row =
                new ActionRowBuilder();



                count = 0;



            }





            row.addComponents(



                new ButtonBuilder()



                .setCustomId(

                    `horror_${choice.next}`

                )



                .setLabel(

                    choice.label

                )



                .setStyle(

                    ButtonStyle.Secondary

                )



            );



            count++;



        }



    }





    // aggiunge inventario solo se c'è spazio

    if(count < 5){



        row.addComponents(



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



        );



        rows.push(row);



    }



    else{



        rows.push(row);



        const inventoryRow =

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



        );



        rows.push(inventoryRow);



    }





    return rows;



}

// ======================================
// RENDER SCENE
// ======================================

async function renderScene(
    interaction,
    player
){


    const node =
    getNode(player);



    if(!node){

        return interaction.reply({

            content:
            "❌ Errore: scena non trovata.",

            ephemeral:true

        });

    }





    // RACCOLTA OGGETTO

    if(
        node.item
        &&
        !player.inventory.includes(node.item)
    ){


        player.inventory.push(

            node.item

        );


    }







    const embed =

    new EmbedBuilder()

    .setTitle(

        getStory(player).title

    )

    .setDescription(

        node.text

    )

    .setColor(

        node.ending
        ?
        "Red"
        :
        "Purple"

    );







    const components =

    node.ending

    ?

    [

    new ActionRowBuilder()

    .addComponents(

        new ButtonBuilder()

        .setCustomId(

            "horror_restart"

        )

        .setLabel(

            "🔄 Ricomincia"

        )

        .setStyle(

            ButtonStyle.Success

        ),



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

    ]

    :

    createButtons(node);









    if(
        interaction.replied
        ||
        interaction.deferred
    ){



        return interaction.editReply({

            embeds:[embed],

            components:components

        });



    }





    return interaction.reply({

        embeds:[embed],

        components:components

    });



}









// ======================================
// MOVE SCENE
// ======================================

async function moveScene(

    interaction,

    next

){



    const player =

    getPlayer(

        interaction.user.id

    );





    if(player.gameOver){


        return interaction.reply({

            content:

            "☠️ Questa storia è terminata.",

            ephemeral:true

        });


    }







    player.scene = next;





    await renderScene(

        interaction,

        player

    );



}









// ======================================
// INVENTORY BUTTON
// ======================================

async function showInventory(

    interaction

){



    const player =

    getPlayer(

        interaction.user.id

    );





    return interaction.reply({



        embeds:[

            inventoryEmbed(player)

        ],



        ephemeral:true



    });



}









// ======================================
// RESTART STORY
// ======================================

async function restartStory(

    interaction

){



    const player =

    getPlayer(

        interaction.user.id

    );



    const story =

    getStory(player);





    if(!story){

        return interaction.reply({

            content:

            "❌ Nessuna storia attiva.",

            ephemeral:true

        });

    }






    player.scene =

    story.start;



    player.inventory = [];



    player.gameOver = false;






    await renderScene(

        interaction,

        player

    );


}









// ======================================
// BUTTON ROUTER
// ======================================

async function buttonHandler(

    interaction

){



    const id =

    interaction.customId;







    if(
        id === "horror_inventory"
    ){



        return showInventory(

            interaction

        );



    }







    if(
        id === "horror_restart"
    ){



        return restartStory(

            interaction

        );


    }









    if(
        id.startsWith(
            "horror_"
        )

    ){



        const next =

        id.replace(

            "horror_",

            ""

        );





        return moveScene(

            interaction,

            next

        );



    }



}








// ======================================
// EXPORT
// ======================================

module.exports = {


    startStory,


    buttonHandler,


    renderScene,


    getPlayer


};
