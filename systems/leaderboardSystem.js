const fs = require("fs");
const path = require("path");


const filePath = path.join(
    __dirname,
    "../data/leaderboard.json"
);


function loadData() {

    if (!fs.existsSync(filePath)) {

        return {
            partner: {},
            sponsor: {},
            collab: {}
        };

    }


    return JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

}



function saveData(data) {

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 4)
    );

}



function addPoint(type, userId) {

    const data = loadData();


    if (!data[type]) {

        data[type] = {};

    }


    if (!data[type][userId]) {

        data[type][userId] = 0;

    }


    data[type][userId]++;


    saveData(data);

}



function getLeaderboard(type) {

    const data = loadData();


    if (!data[type]) {

        return [];

    }


    return Object.entries(data[type])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

}



module.exports = {
    addPoint,
    getLeaderboard
};
