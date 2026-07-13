const fs = require("fs");
const path = require("path");


const FILE =
path.join(
    __dirname,
    "users.json"
);



module.exports = (client) => {


console.log(
    "💬 Message Counter caricato."
);



client.on(
"messageCreate",
async (message) => {



    if(message.author.bot)
        return;



    if(!message.guild)
        return;



    let users = [];



    if(fs.existsSync(FILE)){

        users =
        JSON.parse(
            fs.readFileSync(
                FILE,
                "utf8"
            )
        );

    }



    let user =
    users.find(
        u =>
        u.id === message.author.id
    );



    if(!user){

        user = {

            id:
            message.author.id,

            birthday:
            null,

            messages:
            0,

            lastMessage:
            null

        };


        users.push(user);

    }



    user.messages =
    (user.messages || 0) + 1;



    user.lastMessage =
    Date.now();



    fs.writeFileSync(

        FILE,

        JSON.stringify(
            users,
            null,
            2
        )

    );



});



};
