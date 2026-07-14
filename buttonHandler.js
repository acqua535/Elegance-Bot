const ticket = require("./ticket");
const verify = require("./verify");


module.exports = async function buttonHandler(interaction) {


    try {


        const id = interaction.customId;



        console.log(
            "🔘 Bottone premuto:",
            id
        );



        /*
        =====================
        VERIFY SYSTEM
        =====================
        */


        if(id === "verify_button") {

            return await verify.buttonHandler(interaction);

        }




        /*
        =====================
        TICKET SYSTEM
        =====================
        */


        if(

            id.startsWith("ticket_") ||
            id === "close_ticket" ||
            id === "claim_ticket"

        ){

            return await ticket.buttonHandler(interaction);

        }





        /*
        =====================
        REWARDS SYSTEM
        =====================
        */


        if(id === "claim_daily") {


            const dailySystem =
            require("./dailySystem");


            const result =
            dailySystem.claim(
                interaction.user.id
            );


            return interaction.reply({

                content: result.message,

                ephemeral:true

            });


        }





        if(id === "view_profile") {


            const gameSystem =
            require("./gameSystem");


            const profile =
            gameSystem.getProfile(
                interaction.user.id
            );


            return interaction.reply({

                content:

`
👤 **Profilo**

⭐ XP:
${profile.xp || 0}

🪙 Monete:
${profile.coins || 0}

🔥 Streak:
${profile.streak || 0}
`,

                ephemeral:true

            });


        }





        /*
        =====================
        MINIGAME HUB
        =====================
        */


        if(
            id.startsWith("game_")
        ){

            const minigame =
            require("./commands/minigame");


            return await minigame.buttonHandler(
                interaction
            );


        }





        /*
        =====================
        FUTURE BUTTONS
        =====================
        */


        console.log(
            "⚠️ Bottone senza handler:",
            id
        );



        if(!interaction.replied) {


            return interaction.reply({

                content:
                "❌ Questo pulsante non è ancora configurato.",

                ephemeral:true

            });


        }



    } catch(error) {


        console.error(
            "❌ Errore Button Handler:",
            error
        );


        if(!interaction.replied) {


            await interaction.reply({

                content:
                "❌ Errore durante il pulsante.",

                ephemeral:true

            }).catch(()=>{});


        }


    }


};
