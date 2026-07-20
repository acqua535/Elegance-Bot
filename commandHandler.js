const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("-----------------------------------------");
    console.log("📂 Avvio caricamento comandi (Handler Ibrido)...");
    console.log("-----------------------------------------");

    const rootPath = process.cwd();
    const commandsPath = path.join(rootPath, "commands");
    
    // Lista completa di tutti i file dei tuoi comandi
    const targetCommands = [
        "collab.js", "daily-reward.js", "embed.js", "horror.js", 
        "minigame.js", "modify-suggest.js", "partner.js", "say.js", 
        "sponsor.js", "suggest.js", "unwarn.js", "warn.js", "warnings.js"
    ];

    // Mappa per tenere traccia dei percorsi assoluti dei file trovati
    const filesToLoad = new Map(); // nomeFile -> percorsoAssoluto

    // 1. Cerca prima dentro la cartella 'commands' (se esiste)
    if (fs.existsSync(commandsPath)) {
        const internalItems = fs.readdirSync(commandsPath);
        internalItems.forEach(file => {
            if (targetCommands.includes(file)) {
                filesToLoad.set(file, path.join(commandsPath, file));
            }
        });
    }

    // 2. Cerca anche nella root (per i file rimasti fuori dallo zip)
    const rootItems = fs.readdirSync(rootPath);
    rootItems.forEach(file => {
        if (targetCommands.includes(file) && !filesToLoad.has(file)) {
            filesToLoad.set(file, path.join(rootPath, file));
        }
    });

    console.log(`🔎 [DEBUG] Trovati ${filesToLoad.size} comandi totali distribuiti tra root e cartella.`);

    // 3. Carica i comandi unici in memoria
    for (const [file, filePath] of filesToLoad.entries()) {
        try {
            const command = require(filePath);

            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ [IBRIDO] Caricato: /${command.data.name} (da: ${file})`);
            } else {
                console.log(`⚠️ Struttura non valida per il file: ${file}`);
            }
        } catch (error) {
            console.error(`❌ Errore caricamento file ${file}:`, error);
        }
    }

    console.log("-----------------------------------------");
    console.log(`📦 Caricamento completato! Comandi in memoria: ${client.commands.size}`);
    console.log("-----------------------------------------");
};
