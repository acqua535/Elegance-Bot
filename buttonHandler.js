const {
    EmbedBuilder
} = require("discord.js");



const ticket = require("./ticket");

const verify = require("./verify");

const minigame = require("./minigame");





// ===============================
// GLOBAL BUTTON HANDLER
// ===============================


module.exports = async function buttonHandler(interaction){



    if(
        !interaction.isButton() &&
        !interaction.isStringSelectMenu()
    ) return;





    const id = interaction.customId;





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

            )

        ){



            return ticket.buttonHandler(

                interaction

            );



        }







// ===============================
// WORD DIFFICULTY
// ===============================


        if(id === "word_easy"){



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








        if(id === "word_medium"){



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








        if(id === "word_hard"){



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


        if(

            interaction.isButton()

            &&

            id.startsWith("game_")

        ){



            const game = id.replace(

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
// UNKNOWN BUTTON
// ===============================


        console.log(

            "⚠️ Bottone non gestito:",

            id

        );





    } catch(error){



        console.error(

            "❌ Errore buttonHandler:",

            error

        );





        if(

            !interaction.replied &&

            !interaction.deferred

        ){



            await interaction.reply({


                content:

                "❌ Errore durante il bottone.",


                ephemeral:true


            }).catch(()=>{});



        }



    }



};
