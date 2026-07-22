// inventory.js
const usersDB = new Map();

function initUser(userId) {
    if (!usersDB.has(userId)) {
        usersDB.set(userId, {
            xp: 0,
            coins: 0,
            items: {}, // Es. { "Legno": 5, "Spada": 1 }
            achievements: [], // Array di ID achievement sbloccati
            stats: {
                messages: 0,
                invites: 0,
                gamesPlayed: 0,
                gamesWon: 0,
                bombsDefused: 0,
                quizzesWon: 0
            }
        });
    }
    return usersDB.get(userId);
}

module.exports = {
    getUser: (userId) => initUser(userId),
    
    addXP: (userId, amount) => {
        const user = initUser(userId);
        user.xp += amount;
        return user.xp;
    },
    
    addCoins: (userId, amount) => {
        const user = initUser(userId);
        user.coins += amount;
        return user.coins;
    },
    
    addItem: (userId, item, quantity = 1) => {
        const user = initUser(userId);
        user.items[item] = (user.items[item] || 0) + quantity;
        return user.items[item];
    },
    
    incrementStat: (userId, statName, amount = 1) => {
        const user = initUser(userId);
        if (user.stats[statName] !== undefined) {
            user.stats[statName] += amount;
        }
    },
    
    hasAchievement: (userId, achId) => {
        return initUser(userId).achievements.includes(achId);
    },
    
    unlockAchievement: (userId, achId) => {
        const user = initUser(userId);
        if (!user.achievements.includes(achId)) {
            user.achievements.push(achId);
            return true; // Sbloccato ora
        }
        return false; // Già sbloccato
    }
};
