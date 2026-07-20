const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("-----------------------------------------");
    console.log("📂 Avvio caricamento comandi (Handler Ibrido)...");
    console.log("-----------------------------------------");

    const rootPath = process.cwd();
    const commandsPath = path.join(rootPath, "commands");
    
    // Lista completa dei file inclusi i ticket
    const targetCommands = [
        "collab.js", "daily-reward.js", "embed.js", "horror.js", 
        "minigame.js", "modify-suggest.js", "partner.js", "say.js", 
        "sponsor.js", "suggest.js", "ticket.js", "unwarn.js", "warn.js", "warnings.js"
    ];

    const filesToLoad = new Map();

    // 1. Controlla nella cartella 'commands'
    if (fs.existsSync(commandsPath)) {
        const internalItems = fs.readdirSync(commandsPath);
        internalItems.forEach(file => {
            if (targetCommands.includes(file)) {
                filesToLoad.set(file, path.join(commandsPath, file));
            }
        });
    }

    // 2. Controlla nella root
    const rootItems = fs.readdirSync(rootPath);
    rootItems.forEach(file => {
        if (targetCommands.includes(file) && !filesToLoad.has(file)) {
            filesToLoad.set(file, path.join(rootPath, file));
        }
    });

    console.log(`🔎 [DEBUG] Trovati ${filesToLoad.size} comandi totali distribuiti nel server.`);

    // 3. Carica i comandi in memoria locale
    for (const [file, filePath] of filesToLoad.entries()) {
        try {
            const command = require(filePath);

            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ [IBRIDO] Caricato in memoria: /${command.data.name}`);
            }
        } catch (error) {
            console.error(`❌ Errore caricamento file ${file}:`, error);
        }
    }

    console.log("-----------------------------------------");
    console.log(`📦 Caricamento completato! Comandi in memoria: ${client.commands.size}`);
    console.log("-----------------------------------------");
};
