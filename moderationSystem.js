const fs = require("fs");

const file = "./warnings.json";


function loadWarnings() {

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



function saveWarnings(data) {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 4)
    );

}



function addWarning(userId, moderatorId, reason) {

    const data = loadWarnings();


    if (!data[userId]) {

        data[userId] = [];

    }


    data[userId].push({

        moderator: moderatorId,

        reason: reason,

        date: Date.now()

    });


    saveWarnings(data);


    return data[userId].length;

}



function getWarnings(userId) {

    const data = loadWarnings();


    return data[userId] || [];

}



function clearWarnings(userId) {

    const data = loadWarnings();


    delete data[userId];


    saveWarnings(data);

}



function updateWarnings(userId, warnings) {

    const data = loadWarnings();


    data[userId] = warnings;


    saveWarnings(data);

}



module.exports = {

    addWarning,

    getWarnings,

    clearWarnings,

    updateWarnings

};
