const ticket = require("./ticket");
const verify = require("./verify");

const gameSystem = require("./gameSystem");
const dailySystem = require("./dailySystem");


module.exports = async function buttonHandler(interaction) {

    const id = interaction.customId;


    console.log(
        "🔘 Bottone ricevuto:",
        id
    );



    // =========================
    // VERIFY
    // =========================

    if (id === "verify_button") {

        return verify.buttonHandler(interaction);

    }



    // =========================
    // TICKET
    // =========================

    if (
        id.startsWith("ticket") ||
        id.includes("ticket")
    ) {

        return ticket.buttonHandler(interaction);

    }




    // =========================
    // REWARDS - DAILY
    // =========================

    if (id === "claim_daily") {


        const userId =
        interaction.user.id;



        const result =
        dailySystem.claim(userId);



        if (!result) {

            return interaction.reply({

                content:
                "❌ Hai già riscattato la Daily Reward.",

                ephemeral:true

            });

        }



        return interaction.reply({

            content:
            "🎁 Daily Reward riscattata!",

            ephemeral:true

        });


    }




    // =========================
    // REWARDS - PROFILE
    // =========================

    if (id === "view_profile") {


        const profile =
        gameSystem.getProfile(
            interaction.user.id
        );



        return interaction.reply({

            content:
`👤 **Profilo**

⭐ XP: ${profile.xp || 0}

🪙 Monete: ${profile.coins || 0}

🔥 Streak: ${profile.streak || 0}`,

            ephemeral:true

        });


    }




    // =========================
    // FUTURI BOTTONI
    // =========================


    console.log(
        "⚠️ Bottone senza handler:",
        id
    );


    if (!interaction.replied) {

        return interaction.reply({

            content:
            "⚠️ Questo pulsante non è ancora configurato.",

            ephemeral:true

        }).catch(()=>{});

    }


};
