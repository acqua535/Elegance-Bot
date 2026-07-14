const ticket = require("./ticket");
const verify = require("./verify");


module.exports = async function buttonHandler(interaction) {


    const id = interaction.customId;



    try {


        // VERIFY

        if (id === "verify_button") {

            return verify.buttonHandler(interaction);

        }



        // TICKET

        if (

            id.startsWith("ticket_") ||
            id === "close_ticket" ||
            id === "claim_ticket"

        ) {

            return ticket.buttonHandler(interaction);

        }




        // MINIGAME

        if (

            id === "game_number" ||
            id === "game_quiz" ||
            id === "game_coin" ||
            id === "game_dice" ||
            id === "game_rps"

        ) {

            const minigame = require("./minigame");

            return minigame.buttonHandler(interaction);

        }





        // REWARDS

        if (

            id === "claim_daily" ||
            id === "view_profile"

        ) {


            const rewards = require("./rewards");


            if(rewards.buttonHandler){

                return rewards.buttonHandler(interaction);

            }

        }





        console.log(
            "⚠️ Bottone non gestito:",
            id
        );


        if(!interaction.replied){

            return interaction.reply({

                content:
                "⚠️ Bottone non riconosciuto.",

                ephemeral:true

            });

        }



    } catch(error){


        console.error(
            "❌ Button Handler:",
            error
        );


        if(!interaction.replied){

            interaction.reply({

                content:
                "❌ Errore bottone.",

                ephemeral:true

            }).catch(()=>{});

        }


    }


};
