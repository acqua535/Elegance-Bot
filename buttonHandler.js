const {
    EmbedBuilder
} = require("discord.js");


// ===============================
// IMPORT
// ===============================

const ticket = require("./ticket");
const minigame = require("./minigame");
const verify = require("./commands/verify");
const horrorEngine = require("./horrorEngine");




// ===============================
// GLOBAL BUTTON HANDLER
// ===============================

module.exports = async function buttonHandler(interaction){


    if(
        !interaction.isButton()
        &&
        !interaction.isStringSelectMenu()
    ){
        return;
    }



    const id = interaction.customId;



    console.log(
        "🔘 Interazione ricevuta:",
        id
    );



    try {



        // ===============================
        // VERIFY
        // ===============================

        if(
            interaction.isButton()
            &&
            id === "verify_button"
        ){

            return verify.buttonHandler(
                interaction
            );

        }






        // ===============================
        // HORROR START STORY
        // ===============================

        if(
            interaction.isButton()
            &&
            id.startsWith("horror_start_")
        ){

            const storyId = Number(

                id.replace(
                    "horror_start_",
                    ""
                )

            );


            return horrorEngine.startStory(

                interaction,

                storyId

            );

        }






        // ===============================
        // HORROR GAME BUTTONS
        // ===============================

        if(
            interaction.isButton()
            &&
            (
                id === "horror_inventory"
                ||
                id === "horror_restart"
                ||
                id.startsWith("horror_")
            )
        ){

            return horrorEngine.buttonHandler(

                interaction

            );

        }







        // ===============================
        // TICKET SELECT MENU
        // ===============================


        if(
            interaction.isStringSelectMenu()
            &&
            id === "ticket_manage"
        ){

            return ticket.router(
                interaction
            );

        }






        // ===============================
        // TICKET BUTTONS
        // ===============================


        if(
            interaction.isButton()
            &&
            (
                id === "claim_ticket"
                ||
                id === "close_ticket"
                ||
                id.startsWith("rate_")
                ||
                id.startsWith("ticket_rate")
            )
        ){

            return ticket.buttonHandler(
                interaction
            );

        }







        // ===============================
        // WORD GAME DIFFICULTY
        // ===============================


        if(
            id === "word_easy"
            ||
            id === "word_medium"
            ||
            id === "word_hard"
        ){



            const difficulty =

            id === "word_easy"

            ?

            "facile"

            :

            id === "word_medium"

            ?

            "medio"

            :

            "difficile";




            await interaction.update({

                content:

                `🔤 Modalità ${difficulty} selezionata!`,

                embeds:[],

                components:[]

            });




            return minigame.startWordGame(

                interaction,

                difficulty

            );


        }









        // ===============================
        // MINIGAME HUB
        // ===============================


        if(
            interaction.isButton()
            &&
            id.startsWith("game_")
        ){



            const game =

            id.replace(
                "game_",
                ""
            );





            await interaction.update({

                embeds:[

                    new EmbedBuilder()

                    .setTitle(
                        "🎮 Minigame avviato"
                    )

                    .setDescription(
                        "La partita sta iniziando..."
                    )

                ],

                components:[]

            });







            switch(game){


                case "quiz":

                    return minigame.quizGame(
                        interaction
                    );


                case "memory":

                    return minigame.memoryGame(
                        interaction
                    );


                case "word":

                    return minigame.wordGame(
                        interaction
                    );


                case "reaction":

                    return minigame.reactionGame(
                        interaction
                    );


                case "hangman":

                    return minigame.hangmanGame(
                        interaction
                    );


                default:

                    return interaction.followUp({

                        content:
                        "❌ Minigame non trovato.",

                        ephemeral:true

                    });


            }


        }








        // ===============================
        // UNKNOWN
        // ===============================


        console.log(
            "⚠️ Bottone non gestito:",
            id
        );



        if(
            !interaction.replied
            &&
            !interaction.deferred
        ){

            await interaction.reply({

                content:
                "⚠️ Questo bottone non è configurato.",

                ephemeral:true

            }).catch(()=>{});

        }






    } catch(error){



        console.error(

            "❌ Errore ButtonHandler:",

            error

        );




        if(
            !interaction.replied
            &&
            !interaction.deferred
        ){

            await interaction.reply({

                content:
                "❌ Errore durante il pulsante.",

                ephemeral:true

            }).catch(()=>{});

        }


    }


};
            
