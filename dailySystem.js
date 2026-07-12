const gameSystem = require("./gameSystem");


const DAILY_TIME = 24 * 60 * 60 * 1000;


function canClaim(userId) {

    const profile =
        gameSystem.getProfile(userId);


    const now = Date.now();


    if (!profile.lastDaily) {

        return {
            available: true
        };

    }



    const difference =
        now - profile.lastDaily;



    if (difference >= DAILY_TIME) {

        return {
            available: true
        };

    }



    return {

        available:false,

        remaining:
        DAILY_TIME - difference

    };

}





function claim(userId) {


    const profile =
        gameSystem.getProfile(userId);



    gameSystem.updateProfile(userId, {


        lastDaily:
        Date.now()


    });



    gameSystem.addXP(
        userId,
        50
    );



    gameSystem.addCoins(
        userId,
        100
    );



    return {

        xp:50,

        coins:100

    };

}





function formatTime(ms) {


    const hours =
        Math.floor(
            ms / (1000 * 60 * 60)
        );


    const minutes =
        Math.floor(
            (ms % (1000 * 60 * 60))
            /
            (1000 * 60)
        );



    return `${hours}h ${minutes}m`;

}





module.exports = {

    canClaim,

    claim,

    formatTime

};
