const {
    EmbedBuilder
} = require("discord.js");


const minigame = require("./minigame");


// ===============================
// BUTTON HANDLER GLOBALE
// ===============================


module.exports = async function buttonHandler(interaction) {


    if(!interaction.isButton()) return;



    const id = interaction.customId;



    try {



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


                case "number":

                    await minigame.numberGame(interaction);

                break;



                case "quiz":

                    await minigame.quizGame(interaction);

                break;



                case "memory":

                    await minigame.memoryGame(interaction);

                break;



                case "word":

                    await minigame.wordGame(interaction);

                break;



                case "reaction":

                    await minigame.reactionGame(interaction);

                break;



                case "hangman":

                    await minigame.hangmanGame(interaction);

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


        /*
        
        Esempio:

        if(id === "ticket_create") {

            ...

        }

        */


    } catch(error) {


        console.error(
            "Errore Button Handler:",
            error
        );



        if(!interaction.replied) {


            await interaction.reply({

                content:
                "❌ Errore durante l'esecuzione del bottone.",

                ephemeral:true

            });


        }


    }


};
