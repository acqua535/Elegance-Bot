const fs = require("fs");

const file = "./gameData.json";



// =====================================
// DATABASE
// =====================================


function loadData() {


    if(!fs.existsSync(file)){


        fs.writeFileSync(
            file,
            "{}"
        );


    }



    return JSON.parse(

        fs.readFileSync(
            file,
            "utf8"
        )

    );


}





function saveData(data){


    fs.writeFileSync(

        file,

        JSON.stringify(
            data,
            null,
            4
        )

    );


}






// =====================================
// CREAZIONE PROFILO
// =====================================


function createProfile(userId){


    const data =
    loadData();




    if(!data[userId]){


        data[userId] = {


            // statistiche base

            games:0,

            wins:0,

            losses:0,



            // xp sistema

            xp:0,

            level:1,



            // economia

            coins:0,



            // streak

            streak:0,

            bestStreak:0,



            // achievement

            achievements:[],



            // inventario

            inventory:[],




            // statistiche minigame


            quizWins:0,

            memoryWins:0,

            wordWins:0,

            reactionWins:0,

            hangmanWins:0



        };



        saveData(data);


    }






    const profile =
    data[userId];



    // aggiornamento vecchi profili


    if(!profile.games)
        profile.games = 0;


    if(!profile.wins)
        profile.wins = 0;


    if(!profile.losses)
        profile.losses = 0;



    if(!profile.xp)
        profile.xp = 0;



    if(!profile.level)
        profile.level = 1;



    if(!profile.coins)
        profile.coins = 0;



    if(profile.streak === undefined)
        profile.streak = 0;



    if(profile.bestStreak === undefined)
        profile.bestStreak = 0;



    if(!profile.achievements)
        profile.achievements = [];



    if(!profile.inventory)
        profile.inventory = [];





    if(profile.quizWins === undefined)
        profile.quizWins = 0;


    if(profile.memoryWins === undefined)
        profile.memoryWins = 0;


    if(profile.wordWins === undefined)
        profile.wordWins = 0;


    if(profile.reactionWins === undefined)
        profile.reactionWins = 0;


    if(profile.hangmanWins === undefined)
        profile.hangmanWins = 0;




    saveData(data);



    return profile;


}






function getProfile(userId){


    return createProfile(userId);


}






function updateProfile(userId, changes){


    const data =
    loadData();



    createProfile(userId);



    data[userId] = {


        ...data[userId],


        ...changes


    };



    saveData(data);



}






// =====================================
// XP SYSTEM
// =====================================



function addXP(userId, amount){


    const profile =
    createProfile(userId);



    profile.xp += amount;




    const neededXP =
    profile.level * 100;





    if(profile.xp >= neededXP){



        profile.level++;



        profile.xp = 0;



        profile.coins += 100;



    }




    updateProfile(

        userId,

        profile

    );



}






function addCoins(userId, amount){


    const profile =
    createProfile(userId);



    profile.coins += amount;



    updateProfile(

        userId,

        profile

    );


}







// =====================================
// VITTORIA
// =====================================



function gameWin(userId){


    const profile =
    createProfile(userId);



    profile.games++;


    profile.wins++;



    profile.streak++;





    if(profile.streak > profile.bestStreak){


        profile.bestStreak =
        profile.streak;


    }





    profile.xp += 25;



    profile.coins += 50;





    if(profile.streak % 3 === 0){



        profile.inventory.push(

            "🎁 Reward Box"

        );



    }






    if(profile.streak === 5){



        if(
            !profile.inventory.includes(
                "🛡️ Streak Shield"
            )
        ){


            profile.inventory.push(

                "🛡️ Streak Shield"

            );


        }


    }






    updateProfile(

        userId,

        profile

    );



}







// =====================================
// SCONFITTA
// =====================================



function gameLose(userId){


    const profile =
    createProfile(userId);



    profile.games++;


    profile.losses++;





    const extraLife =

    profile.inventory.indexOf(

        "❤️ Extra Life"

    );



    const shield =

    profile.inventory.indexOf(

        "🛡️ Streak Shield"

    );






    if(extraLife !== -1){



        profile.inventory.splice(

            extraLife,

            1

        );



    }



    else if(shield !== -1){



        profile.inventory.splice(

            shield,

            1

        );



    }



    else{


        profile.streak = 0;


    }





    profile.xp += 5;



    updateProfile(

        userId,

        profile

    );


            }

// =====================================
// ACHIEVEMENT SYSTEM
// =====================================


const achievementSystem =
require("./achievement");





function checkAchievements(userId){


    const profile =
    createProfile(userId);



    const allAchievements =
    achievementSystem.achievements;



    let unlocked = [];





    for(const id in allAchievements){



        const achievement =
        allAchievements[id];



        let condition = false;





        switch(id){



            // =====================
            // GENERALI
            // =====================


            case "first_game":

                condition =
                profile.games >= 1;

            break;



            case "games_10":

                condition =
                profile.games >= 10;

            break;



            case "games_50":

                condition =
                profile.games >= 50;

            break;





            // =====================
            // QUIZ
            // =====================


            case "quiz_first":

                condition =
                profile.quizWins >= 1;

            break;



            case "quiz_10":

                condition =
                profile.quizWins >= 10;

            break;



            case "quiz_30":

                condition =
                profile.quizWins >= 30;

            break;






            // =====================
            // MEMORY
            // =====================


            case "memory_first":

                condition =
                profile.memoryWins >= 1;

            break;



            case "memory_10":

                condition =
                profile.memoryWins >= 10;

            break;






            // =====================
            // PAROLA
            // =====================


            case "word_first":

                condition =
                profile.wordWins >= 1;

            break;



            case "word_all":

                condition =
                profile.wordWins >= 10;

            break;







            // =====================
            // REACTION
            // =====================


            case "reaction_first":

                condition =
                profile.reactionWins >= 1;

            break;



            case "reaction_fast":

                condition =
                profile.reactionWins >= 5;

            break;







            // =====================
            // IMPICCATO
            // =====================


            case "hangman_first":

                condition =
                profile.hangmanWins >= 1;

            break;



            case "hangman_5":

                condition =
                profile.hangmanWins >= 5;

            break;







            // =====================
            // FINALE
            // =====================


            case "ultimate_player":



                condition =

                Object.keys(allAchievements)

                .filter(
                    a =>
                    a !== "ultimate_player"
                )

                .every(

                    a =>

                    profile.achievements
                    .includes(a)

                );


            break;



        }





        if(

            condition &&

            !profile.achievements.includes(id)

        ){



            profile.achievements.push(id);



            profile.xp +=
            achievement.reward || 0;





            unlocked.push(

                achievement.name

            );





            // ricompense speciali


            if(id === "ultimate_player"){


                if(

                    !profile.inventory.includes(

                        "👑 Legendary Trophy"

                    )

                ){


                    profile.inventory.push(

                        "👑 Legendary Trophy"

                    );


                }


            }



        }



    }






    updateProfile(

        userId,

        profile

    );




    return unlocked;


}








// =====================================
// MINIGAME COUNTERS
// =====================================



function addGameStat(userId, game){


    const profile =
    createProfile(userId);




    const stats = {


        quiz:
        "quizWins",


        memory:
        "memoryWins",


        word:
        "wordWins",


        reaction:
        "reactionWins",


        hangman:
        "hangmanWins"



    };





    if(stats[game]){


        profile[stats[game]]++;


    }





    updateProfile(

        userId,

        profile

    );



}








// =====================================
// EXPORT
// =====================================



module.exports = {


    getProfile,

    updateProfile,


    addXP,

    addCoins,


    gameWin,

    gameLose,


    checkAchievements,


    addGameStat


};
