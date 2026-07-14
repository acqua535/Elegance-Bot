const fs = require("fs");
const path = require("path");


module.exports = function loadCommands(client) {


    const folders = [

        __dirname,

        path.join(__dirname, "commands")

    ];



    const loaded = new Set();



    for (const folder of folders) {


        if(!fs.existsSync(folder))
            continue;



        const files =
        fs.readdirSync(folder)
        .filter(file =>
            file.endsWith(".js")
        );



        for(const file of files){


            if(
                file === "index.js" ||
                file === "commandHandler.js" ||
                file === "deployCommand.js"
            )
                continue;



            const filePath =
            path.join(folder,file);



            if(loaded.has(filePath))
                continue;



            const command =
            require(filePath);



            if(!command.data || !command.execute)
                continue;



            if(client.commands.has(command.data.name)){

                console.log(
                    `⚠️ Duplicato ignorato: ${command.data.name}`
                );

                continue;

            }



            client.commands.set(
                command.data.name,
                command
            );



            loaded.add(filePath);



            console.log(
                `✅ Comando caricato: ${command.data.name}`
            );


        }

    }


};
