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

            "{}",

            "utf8"

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

        ),

        "utf8"

    );


}






// =====================================
// CREATE TICKET
// =====================================

function createTicket(userId, ticket){


    const data = loadData();



    data[userId] = {


        userId,


        ...ticket,


        createdAt:

        ticket.createdAt || Date.now()



    };



    saveData(data);



    return true;


}







// =====================================
// GET USER TICKET
// =====================================

function getTicket(userId){


    const data = loadData();



    return data[userId] || null;


}







// =====================================
// GET BY CHANNEL
// =====================================

function getTicketByChannel(channelId){


    const data = loadData();



    return Object.values(data).find(


        ticket =>

        ticket.channelId === channelId


    ) || null;


}







// =====================================
// UPDATE TICKET
// =====================================

function updateTicket(userId, newData){


    const data = loadData();



    if(!data[userId])

        return false;





    data[userId] = {


        ...data[userId],


        ...newData



    };



    saveData(data);



    return true;


}







// =====================================
// DELETE TICKET
// =====================================

function deleteTicket(userId){



    const data = loadData();



    if(!data[userId])

        return false;





    delete data[userId];



    saveData(data);



    return true;


}







// =====================================
// OPEN CHECK
// =====================================

function hasOpenTicket(userId){


    return Boolean(

        getTicket(userId)

    );


}







// =====================================
// STAFF PING SYSTEM
// =====================================

function canPingStaff(userId){



    const ticket = getTicket(userId);



    if(!ticket)

        return false;





    if(!ticket.staffPing)

        return true;





    const cooldown =

    24 * 60 * 60 * 1000;





    return (

        Date.now() -

        ticket.staffPing.time

    ) >= cooldown;


}







function useStaffPing(userId){



    const ticket = getTicket(userId);



    if(!ticket)

        return false;





    ticket.staffPing = {


        used:true,


        time:Date.now()


    };





    return updateTicket(

        userId,

        ticket

    );


}







function resetStaffPing(userId){



    const ticket = getTicket(userId);



    if(!ticket)

        return false;





    ticket.staffPing = {


        used:false,


        time:null


    };





    return updateTicket(

        userId,

        ticket

    );


}







// =====================================
// ALL TICKETS
// =====================================

function getAllTickets(){


    return loadData();


}







// =====================================
// EXPORT
// =====================================

module.exports = {


    createTicket,


    getTicket,


    getTicketByChannel,


    updateTicket,


    deleteTicket,


    hasOpenTicket,


    canPingStaff,


    useStaffPing,


    resetStaffPing,


    getAllTickets


};

