const fs = require("fs");


// =====================================
// CONFIG
// =====================================

const file = "./ticketsData.json";




// =====================================
// LOAD
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
            "❌ Errore database ticket:",
            error
        );


        return {};


    }


}






// =====================================
// SAVE
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
// CREATE / SAVE TICKET
// =====================================

function createTicket(userId, ticket){


    const data = loadData();



    data[userId] = {


        ...ticket,


        userId,


        createdAt: Date.now()


    };



    saveData(data);


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
// UPDATE
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
// DELETE
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
// CHECK OPEN
// =====================================

function hasOpenTicket(userId){


    return Boolean(

        getTicket(userId)

    );


}






// =====================================
// STAFF PING COOLDOWN
// =====================================

function canPingStaff(userId){


    const ticket = getTicket(userId);



    if(!ticket)
        return false;



    if(!ticket.staffPing)
        return true;



    if(ticket.staffPing.used === false)
        return true;




    const cooldown = 24 * 60 * 60 * 1000;



    return Date.now() - ticket.staffPing.time >= cooldown;


}






function useStaffPing(userId){


    const ticket = getTicket(userId);



    if(!ticket)
        return false;



    ticket.staffPing = {


        used:true,


        time:Date.now(),


        staffReplied:false


    };



    return updateTicket(

        userId,

        ticket

    );


}






// =====================================
// STAFF REPLY RESET
// =====================================

function resetStaffPing(userId){


    const ticket = getTicket(userId);



    if(!ticket)
        return false;



    ticket.staffPing = {


        used:false,


        time:null,


        staffReplied:true


    };



    return updateTicket(

        userId,

        ticket

    );


}






// =====================================
// ALL
// =====================================

function getAllTickets(){


    return loadData();


}






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
