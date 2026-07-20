const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("-----------------------------------------");
    console.log("📂 Avvio caricamento locale dei comandi...");
    console.log("-----------------------------------------");

    // Usa process.cwd() per puntare SEMPRE alla cartella principale del bot su Discloud
    const commandsPath = path.join(process.cwd(), "commands");

    console.log(`🔎 [DEBUG] Il bot sta cercando i comandi in: ${commandsPath}`);

    if (!fs.existsSync(commandsPath)) {
        console.log(`⚠️ Errore critico: La cartella 'commands' non esiste in: ${commandsPath}`);
        // Proviamo il fallback su __dirname se process.cwd fallisse per qualche motivo strano
        const fallbackPath = path.join(__dirname, "commands");
        console.log(`🔄 Tento il fallback su percorso interno: ${fallbackPath}`);
        if (fs.existsSync(fallbackPath)) {
            commandsPath = fallbackPath;
        } else {
            return;
        }
    }

    // 🔍 SPIONE DI FILE: Ci dice ESATTAMENTE cosa vede Node dentro la cartella
    const allItems = fs.readdirSync(commandsPath);
    console.log("🔎 [DEBUG] Tutti i file grezzi trovati in 'commands':", allItems);

    const files = allItems.filter(file => file.endsWith(".js"));

    if (files.length === 0) {
        console.log("⚠️ Attenzione: La cartella 'commands' è vuota o nessun file finisce per .js.");
        console.log("-----------------------------------------");
        console.log(`📦 Caricamento completato! Comandi pronti in memoria: ${client.commands.size}`);
        console.log("-----------------------------------------");
        return;
    }

    for (const file of files) {
        try {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            // Controllo rigoroso sulla struttura del comando
            if (!command.data || !command.execute) {
                console.log(`⚠️ Il file '${file}' è stato saltato perché manca di 'data' o della funzione 'execute'.`);
                continue;
            }

            if (client.commands.has(command.data.name)) {
                console.log(`⚠️ Comando duplicato ignorato: ${command.data.name}`);
                continue;
            }

            // Salviamo il comando nella Collection del client
            client.commands.set(command.data.name, command);
            console.log(`✅ [LOCALE] Comando caricato in memoria: /${command.data.name}`);

        } catch (error) {
            console.error(`❌ Errore durante il caricamento del file ${file}:`, error);
        }
    }

    console.log("-----------------------------------------");
    console.log(`📦 Caricamento completato! Comandi pronti in memoria: ${client.commands.size}`);
    console.log("-----------------------------------------");
};
