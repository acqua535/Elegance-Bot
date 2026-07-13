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

            achievements: [],

            inventory: []

        };


        saveData(data);

    }


    return data[userId];

}



function getProfile(userId) {

    return createProfile(userId);

}



function updateProfile(userId, changes) {

    const data = loadData();


    createProfile(userId);


    data[userId] = {

        ...data[userId],
        ...changes

    };


    saveData(data);

}



function addXP(userId, amount) {

    const profile =
        createProfile(userId);


    profile.xp += amount;


    const needed =
        profile.level * 100;


    if (profile.xp >= needed) {

        profile.level++;

        profile.xp = 0;

    }


    updateProfile(
        userId,
        profile
    );

}



function addCoins(userId, amount) {

    const profile =
        createProfile(userId);


    profile.coins += amount;


    updateProfile(
        userId,
        profile
    );

}




// SISTEMA AUTOMATICO ACHIEVEMENT

function checkAchievements(userId) {


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
            id:"rich",
            name:"🪙 Ricco",
            condition:
            profile.coins >= 1000,
            reward:200
        }

    ];



    let unlocked = [];



    for(
        const achievement of achievements
    ){


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

    checkAchievements

};
