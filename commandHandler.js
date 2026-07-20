const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("-----------------------------------------");
    console.log("📂 Avvio caricamento comandi (Handler Ibrido)...");
    console.log("-----------------------------------------");

    const rootPath = process.cwd();
    const commandsPath = path.join(rootPath, "commands");
    
    // Lista pulita: horror.js è stato rimosso per evitare crash
    const targetCommands = [
        "collab.js", "daily-reward.js", "embed.js", 
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

    // 2. Controlla nella root (dove tieni ticket.js)
    const rootItems = fs.readdirSync(rootPath);
    rootItems.forEach(file => {
        if (targetCommands.includes(file) && !filesToLoad.has(file)) {
            filesToLoad.set(file, path.join(rootPath, file));
        }
    });

    console.log(`🔎 [DEBUG] Trovati ${filesToLoad.size} file candidati.`);

    // 3. Carica i comandi in memoria
    for (const [file, filePath] of filesToLoad.entries()) {
        try {
            // Eliminiamo la cache del require per sicurezza
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            // Verifica che il comando abbia la struttura corretta
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ [IBRIDO] Caricato in memoria: /${command.data.name}`);
            } else {
                console.log(`⚠️ [IBRIDO] Saltato: ${file} (Manca data o execute)`);
            }
        } catch (error) {
            console.error(`❌ Errore caricamento file ${file}:`, error);
        }
    }

    console.log("-----------------------------------------");
    console.log(`📦 Caricamento completato! Comandi totali: ${client.commands.size}`);
    console.log("-----------------------------------------");
};
