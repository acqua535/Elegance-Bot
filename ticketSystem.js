const fs = require("fs");


// =====================================
// CONFIG
// =====================================

const file = "./ticketsData.json";



// =====================================
// LOAD DATABASE
// =====================================

function loadData(){


    if(!fs.existsSync(file)){


        fs.writeFileSync(

            file,

            "{}"

        );


    }



    try{


        return JSON.parse(

            fs.readFileSync(

                file,

                "utf8"

            )

        );


    }catch(error){


        console.error(
            "❌ Errore lettura ticketsData.json:",
            error
        );


        return {};


    }


}






// =====================================
// SAVE DATABASE
// =====================================

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
// SAVE TICKET
// =====================================

function saveTicket(userId, ticket){


    const data = loadData();



    data[userId] = ticket;



    saveData(data);


}






// =====================================
// GET TICKET
// =====================================

function getTicket(userId){


    const data = loadData();



    return data[userId] || null;


}






// =====================================
// UPDATE TICKET
// =====================================

function updateTicket(userId, ticket){


    const data = loadData();



    if(!data[userId])
        return false;




    data[userId] = ticket;



    saveData(data);



    return true;


}







// =====================================
// DELETE TICKET
// =====================================

function deleteTicket(userId){


    const data = loadData();



    if(data[userId]){


        delete data[userId];


        saveData(data);


        return true;


    }



    return false;


}







// =====================================
// CHECK OPEN TICKET
// =====================================

function hasOpenTicket(userId){


    const data = loadData();



    return Boolean(

        data[userId]

    );


}






// =====================================
// GET ALL TICKETS
// =====================================

function getAllTickets(){


    return loadData();


}






// =====================================
// EXPORT
// =====================================

module.exports = {


    saveTicket,


    getTicket,


    updateTicket,


    deleteTicket,


    hasOpenTicket,


    getAllTickets


};
