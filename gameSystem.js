const fs = require("fs");

const file = "./gameData.json";



function loadData() {

    if (!fs.existsSync(file)) {

        fs.writeFileSync(
            file,
            "{}"
        );

    }


    return JSON.parse(
        fs.readFileSync(file, "utf8")
    );

}



function saveData(data) {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 4)
    );

}





function createProfile(userId) {


    const data = loadData();



    if (!data[userId]) {


        data[userId] = {

            wins: 0,
            losses: 0,
            games: 0,


            xp: 0,
            level: 1,


            coins: 0,


            lastDaily: 0,


            streak: 0,
            bestStreak: 0,


            achievements: [],


            inventory: []

        };


        saveData(data);


    }



    // Aggiorna vecchi profili

    const profile = data[userId];


    if(profile.streak === undefined)
        profile.streak = 0;


    if(profile.bestStreak === undefined)
        profile.bestStreak = 0;


    if(!profile.inventory)
        profile.inventory = [];


    if(!profile.achievements)
        profile.achievements = [];



    saveData(data);



    return profile;

}





function getProfile(userId){

    return createProfile(userId);

}





function updateProfile(userId, changes){


    const data = loadData();


    createProfile(userId);



    data[userId] = {

        ...data[userId],

        ...changes

    };



    saveData(data);

}





function addXP(userId, amount){


    const profile =
    createProfile(userId);



    profile.xp += amount;



    const needed =
    profile.level * 100;



    if(profile.xp >= needed){


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






// =======================
// SISTEMA VITTORIA
// =======================


function gameWin(userId){


    const profile =
    createProfile(userId);



    profile.wins++;


    profile.games++;


    profile.streak++;



    if(profile.streak > profile.bestStreak){

        profile.bestStreak =
        profile.streak;

    }



    profile.xp += 25;


    profile.coins += 50;




    // Reward ogni 3 streak

    if(profile.streak % 3 === 0){


        profile.inventory.push(
            "🎁 Reward Box"
        );


    }





    // 5 streak

    if(profile.streak === 5){


        profile.achievements.push(
            "🔥 Unstoppable Warrior"
        );



        profile.inventory.push(
            "🛡️ Streak Shield"
        );


    }



    updateProfile(
        userId,
        profile
    );

}





// =======================
// SISTEMA SCONFITTA
// =======================


function gameLose(userId){


    const profile =
    createProfile(userId);




    profile.losses++;


    profile.games++;




    // Cerca protezioni


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





// =======================
// ACHIEVEMENT AUTOMATICI
// =======================


function checkAchievements(userId){


    const profile =
    createProfile(userId);



    const achievements = [


        {
            id:"first_game",
            name:"🎮 Primo Passo",
            condition:
            profile.games >= 1,
            reward:50
        },


        {
            id:"games_10",
            name:"🔥 Giocatore Attivo",
            condition:
            profile.games >= 10,
            reward:100
        },


        {
            id:"first_win",
            name:"🏆 Prima Vittoria",
            condition:
            profile.wins >= 1,
            reward:75
        },


        {
            id:"streak_5",
            name:"⚔️ Guerriero Inarrestabile",
            condition:
            profile.bestStreak >= 5,
            reward:200
        },


        {
            id:"streak_10",
            name:"👑 Leggenda delle Streak",
            condition:
            profile.bestStreak >= 10,
            reward:500
        },


        {
            id:"rich",
            name:"🪙 Re delle Monete",
            condition:
            profile.coins >= 1000,
            reward:200
        }


    ];





    let unlocked = [];



    for(const achievement of achievements){


        if(

            achievement.condition &&

            !profile.achievements.includes(
                achievement.id
            )

        ){


            profile.achievements.push(
                achievement.id
            );


            profile.xp +=
            achievement.reward;



            unlocked.push(
                achievement.name
            );


        }


    }



    updateProfile(
        userId,
        profile
    );



    return unlocked;

}




module.exports = {


    getProfile,

    updateProfile,

    addXP,

    addCoins,

    gameWin,

    gameLose,

    checkAchievements

};
