const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("🔥 [DEBUG MOD] Avvio diagnosi comandi...");
    const rootPath = process.cwd();
    const commandsFolder = path.join(rootPath, "commands");

    // Raccogliamo tutti i file .js sia dalla Root che dalla cartella /commands
    let filesToLoad = [];

    // 1. Cerca file .js nella Root
    const rootFiles = fs.readdirSync(rootPath)
        .filter(file => file.endsWith(".js"));
    
    rootFiles.forEach(file => filesToLoad.push(path.join(rootPath, file)));

    // 2. Cerca file .js nella cartella commands (se esiste)
    if (fs.existsSync(commandsFolder)) {
        const subFiles = fs.readdirSync(commandsFolder)
            .filter(file => file.endsWith(".js"));
        
        subFiles.forEach(file => filesToLoad.push(path.join(commandsFolder, file)));
    }

    filesToLoad.forEach(filePath => {
        const fileName = path.basename(filePath);

        // Ignoriamo i file di configurazione, handler o main che non sono comandi slash
        const ignoredFiles = [
            "index.js", "main.js", "commandHandler.js", 
            "deployCommand.js", "deploy-commands.js", "buttonHandler.js"
        ];

        if (ignoredFiles.includes(fileName)) return;

        try {
            // Rimuove la cache per caricare sempre la versione più aggiornata
            delete require.cache[require.resolve(filePath)];
            
            const command = require(filePath);

            // Verifichiamo che sia un comando slash valido (con 'data' ed 'execute')
            if (!command || !command.data || !command.execute) {
                return; // Ignora silenziosamente file ausiliari o helper
            }

            client.commands.set(command.data.name, command);
            console.log(`✅ CARICATO CORRETTAMENTE: /${command.data.name} (${path.relative(rootPath, filePath)})`);

        } catch (err) {
            console.error("--------------------------------------------------");
            console.error(`🚨 ERRORE FATALE NEL FILE: ${fileName}`);
            console.error(`📝 Dettaglio: ${err.message}`);
            console.error("--------------------------------------------------");
        }
    });

    console.log(`📦 Caricamento terminato. Comandi pronti: ${client.commands.size}`);
};
                          
