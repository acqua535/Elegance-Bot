const fs = require("fs");

const file = "./gameData.json";

const fs = require("fs");

console.log(
    fs.existsSync("./achievement.js")
);



// =====================================
// DATABASE
// =====================================


function loadData(){


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
// PROFILO
// =====================================


function createProfile(userId){


    const data =
    loadData();




    if(!data[userId]){


        data[userId] = {

            games:0,

            wins:0,

            losses:0,


            xp:0,

            level:1,


            coins:0,


            streak:0,

            bestStreak:0,


            achievements:[],


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



    const defaults = {


        games:0,

        wins:0,

        losses:0,


        xp:0,

        level:1,


        coins:0,


        streak:0,

        bestStreak:0,


        achievements:[],


        inventory:[],


        quizWins:0,

        memoryWins:0,

        wordWins:0,

        reactionWins:0,

        hangmanWins:0


    };





    for(const key in defaults){


        if(profile[key] === undefined){


            profile[key] =
            defaults[key];


        }


    }





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
// XP
// =====================================



function addXP(userId, amount){


    const profile =
    createProfile(userId);



    profile.xp += amount;



    const needed =
    profile.level * 100;




    while(profile.xp >= needed){


        profile.xp -= needed;


        profile.level++;


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
// VITTORIA BASE
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





    profile.coins += 50;



    updateProfile(

        userId,

        profile

    );


}








// =====================================
// SCONFITTA BASE
// =====================================



function gameLose(userId){


    const profile =
    createProfile(userId);



    profile.games++;


    profile.losses++;




    profile.streak = 0;




    updateProfile(

        userId,

        profile

    );


    }

 
// =====================================
// MINIGAME STATISTICS
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
// ACHIEVEMENTS
// =====================================



const achievementSystem =
require("./achievement");





function checkAchievements(userId){


    const profile =
    createProfile(userId);



    const achievements =
    achievementSystem.achievements;



    let unlocked = [];





    for(const id in achievements){



        const achievement =
        achievements[id];



        let completed = false;





        switch(id){



            // =====================
            // GENERALI
            // =====================


            case "first_game":

                completed =
                profile.games >= 1;

            break;



            case "games_10":

                completed =
                profile.games >= 10;

            break;



            case "games_50":

                completed =
                profile.games >= 50;

            break;





            // =====================
            // QUIZ
            // =====================


            case "quiz_first":

                completed =
                profile.quizWins >= 1;

            break;



            case "quiz_10":

                completed =
                profile.quizWins >= 10;

            break;



            case "quiz_30":

                completed =
                profile.quizWins >= 30;

            break;





            // =====================
            // MEMORY
            // =====================


            case "memory_first":

                completed =
                profile.memoryWins >= 1;

            break;



            case "memory_10":

                completed =
                profile.memoryWins >= 10;

            break;





            // =====================
            // PAROLA
            // =====================


            case "word_first":

                completed =
                profile.wordWins >= 1;

            break;



            case "word_10":

                completed =
                profile.wordWins >= 10;

            break;





            // =====================
            // REACTION
            // =====================


            case "reaction_first":

                completed =
                profile.reactionWins >= 1;

            break;



            case "reaction_5":

                completed =
                profile.reactionWins >= 5;

            break;





            // =====================
            // IMPICCATO
            // =====================


            case "hangman_first":

                completed =
                profile.hangmanWins >= 1;

            break;



            case "hangman_5":

                completed =
                profile.hangmanWins >= 5;

            break;





            // =====================
            // COMPLETAMENTO
            // =====================


            case "ultimate_player":


                const required = [

                    "first_game",

                    "games_10",

                    "games_50",

                    "quiz_first",

                    "quiz_10",

                    "quiz_30",

                    "memory_first",

                    "memory_10",

                    "word_first",

                    "word_10",

                    "reaction_first",

                    "reaction_5",

                    "hangman_first",

                    "hangman_5"

                ];



                completed =

                required.every(

                    a =>

                    profile.achievements.includes(a)

                );


            break;


        }






        if(

            completed &&

            !profile.achievements.includes(id)

        ){



            profile.achievements.push(id);



            profile.xp +=

            achievement.reward || 0;



            unlocked.push(

                achievement.name

            );






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
// EXPORT
// =====================================



module.exports = {


    getProfile,


    updateProfile,


    addXP,


    addCoins,


    gameWin,


    gameLose,


    addGameStat,


    checkAchievements


};
