const {
    EmbedBuilder
} = require("discord.js");

const ticket = require("./ticket");


const minigame = require("./minigame");


// ===============================
// BUTTON HANDLER GLOBALE
// ===============================


module.exports = async function buttonHandler(interaction) {


    if(!interaction.isButton()) return;



    if(
        interaction.replied ||
        interaction.deferred
    ) return;



    const id = interaction.customId;

    // ===============================
// TICKET BUTTONS
// ===============================

if (
    id === "claim_ticket" ||
    id === "close_ticket"
) {

    return ticket.buttonHandler(interaction);

}



    try {



        // ===============================
        // PAROLA MISTERIOSA DIFFICOLTÀ
        // ===============================


        if(id === "word_easy") {


            await interaction.update({

                content:
                "🔤 Modalità Facile selezionata!",

                embeds:[],

                components:[]

            });



            await minigame.startWordGame(
                interaction,
                "facile"
            );


            return;

        }





        if(id === "word_medium") {


            await interaction.update({

                content:
                "🔤 Modalità Media selezionata!",

                embeds:[],

                components:[]

            });



            await minigame.startWordGame(
                interaction,
                "medio"
            );


            return;

        }





        if(id === "word_hard") {


            await interaction.update({

                content:
                "🔤 Modalità Difficile selezionata!",

                embeds:[],

                components:[]

            });



            await minigame.startWordGame(
                interaction,
                "difficile"
            );


            return;

        }





        // ===============================
        // MINIGAME HUB
        // ===============================


        if(id.startsWith("game_")) {


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

                    .setColor("Green")

                ],

                components:[]

            });





            switch(game) {



                case "quiz":


                    await minigame.quizGame(
                        interaction
                    );


                break;





                case "memory":


                    await minigame.memoryGame(
                        interaction
                    );


                break;





                case "word":


                    await minigame.wordGame(
                        interaction
                    );


                break;





                case "reaction":


                    await minigame.reactionGame(
                        interaction
                    );


                break;





                case "hangman":


                    await minigame.hangmanGame(
                        interaction
                    );


                break;





                default:


                    await interaction.followUp({

                        content:
                        "❌ Minigame non trovato.",

                        ephemeral:true

                    });


            }


            return;

        }





        // ===============================
        // ALTRI BOTTONI FUTURI
        // ===============================



    } catch(error) {


        console.error(
            "❌ Errore Button Handler:",
            error
        );



        if(
            !interaction.replied &&
            !interaction.deferred
        ) {


            await interaction.reply({

                content:
                "❌ Errore durante l'esecuzione del bottone.",

                ephemeral:true

            }).catch(()=>{});


        }


    }


};
