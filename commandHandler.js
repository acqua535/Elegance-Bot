const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("-----------------------------------------");
    console.log("📂 Avvio caricamento locale dei comandi...");
    console.log("-----------------------------------------");

    // FIX SICURO: Usiamo __dirname per puntare alla cartella reale del bot
    const commandsPath = path.join(__dirname, "commands");

    if (!fs.existsSync(commandsPath)) {
        console.log(`⚠️ Errore critico: La cartella 'commands' non esiste in: ${commandsPath}`);
        return;
    }

    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    if (files.length === 0) {
        console.log("⚠️ Attenzione: La cartella 'commands' è vuota. Nessun file .js trovato.");
        return;
    }

    for (const file of files) {
        try {
            // FIX: require corretto usando il path assoluto
            const command = require(path.join(commandsPath, file));

            if (!command.data || !command.execute) {
                console.log(`⚠️ Il file '${file}' è stato saltato perché manca di 'data' o della funzione 'execute'.`);
                continue;
            }

            if (client.commands.has(command.data.name)) {
                console.log(`⚠️ Comando duplicato ignorato: ${command.data.name}`);
                continue;
            }

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
