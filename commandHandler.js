const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("-----------------------------------------");
    console.log("📂 Avvio caricamento locale dei comandi...");
    console.log("-----------------------------------------");

    // Risoluzione assoluta per non sbagliare percorso su Linux
    const commandsPath = path.resolve(__dirname, "commands");

    if (!fs.existsSync(commandsPath)) {
        console.log(`⚠️ Errore critico: La cartella 'commands' non esiste in: ${commandsPath}`);
        return;
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
