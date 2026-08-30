const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("🔥 [DEBUG MOD] Avvio diagnosi comandi...");
    const rootPath = process.cwd();
    const commandsFolder = path.join(rootPath, "commands");

    let filesToLoad = new Map();

    // 🛡️ Filtro anti-fantasmi, spazi e file duplicati con parentesi (es. logSystem (1).js)
    const isValidJsFile = (file) => {
        if (!file.endsWith(".js")) return false;
        if (file.includes("(") || file.includes(")")) return false; // Ignora cloni con parentesi
        if (file.includes(" ")) return false; // Ignora file con spazi
        return true;
    };

    // 1. Cerca file .js nella cartella /commands
    if (fs.existsSync(commandsFolder)) {
        const subFiles = fs.readdirSync(commandsFolder).filter(isValidJsFile);
        subFiles.forEach(file => filesToLoad.set(file, path.join(commandsFolder, file)));
    }

    // 2. Cerca file .js nella Root
    const rootFiles = fs.readdirSync(rootPath).filter(isValidJsFile);
    rootFiles.forEach(file => {
        if (!filesToLoad.has(file)) {
            filesToLoad.set(file, path.join(rootPath, file));
        }
    });

    console.log(`🔍 [DIAGNOSI] Trovati ${filesToLoad.size} file .js validi da analizzare.`);

    filesToLoad.forEach((filePath, fileName) => {
        const ignoredFiles = [
            "index.js", "main.js", "commandHandler.js", 
            "deployCommand.js", "deploy-commands.js", "buttonHandler.js"
        ];

        if (ignoredFiles.includes(fileName)) return;

        try {
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if (!command) {
                console.warn(`⚠️ [SALTATO] ${fileName}: Il file è vuoto o non esporta nulla.`);
                return;
            }
            if (!command.data) {
                console.warn(`⚠️ [SALTATO] ${fileName}: Manca la proprietà 'data' (SlashCommandBuilder).`);
                return;
            }
            if (!command.execute) {
                console.warn(`⚠️ [SALTATO] ${fileName}: Manca la funzione 'execute'.`);
                return;
            }

            client.commands.set(command.data.name, command);
            console.log(`✅ CARICATO CORRETTAMENTE: /${command.data.name} (${path.relative(rootPath, filePath)})`);

        } catch (err) {
            console.error("--------------------------------------------------");
            console.error(`🚨 ERRORE SINTASSI O IMPORT NEL FILE: ${fileName}`);
            console.error(`📝 Dettaglio: ${err.message}`);
            console.error(`📍 Stack: ${err.stack}`);
            console.error("--------------------------------------------------");
        }
    });

    console.log(`📦 Caricamento terminato. Comandi pronti: ${client.commands.size}`);
};
