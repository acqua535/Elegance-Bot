const players = new Map();

function createPlayer(userId){

    if(players.has(userId))
        return players.get(userId);

    const data = {

        story: null,

        scene: 0,

        inventory: [],

        endings: [],

        gameOver: false

    };

    players.set(userId,data);

    return data;

}

function getPlayer(userId){

    return createPlayer(userId);

}

function addItem(userId,item){

    const p = createPlayer(userId);

    if(!p.inventory.includes(item))
        p.inventory.push(item);

}

function hasItem(userId,item){

    return createPlayer(userId).inventory.includes(item);

}

function addEnding(userId,ending){

    const p = createPlayer(userId);

    if(!p.endings.includes(ending))
        p.endings.push(ending);

}

function reset(userId){

    players.delete(userId);

}

module.exports = {

    getPlayer,

    addItem,

    hasItem,

    addEnding,

    reset

};
