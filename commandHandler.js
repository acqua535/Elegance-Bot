const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("-----------------------------------------");
    console.log("📂 AVVIO ISPEZIONE ROOT DISCLOUD...");
    console.log("-----------------------------------------");

    try {
        // Ispezioniamo la cartella principale del server per capire dove sono finiti i file
        const rootFiles = fs.readdirSync("/home/node");
        console.log("🔎 [DISCLOUD ROOT] Ecco cosa c'è davvero dentro /home/node:", rootFiles);
    } catch (err) {
        console.log("❌ Impossibile leggere /home/node:", err.message);
    }

    // Proviamo a forzare il percorso usando il path relativo pulito
    const commandsPath = path.join(__dirname, "commands");
    console.log(`🔎 [DEBUG] Provo a cercare 'commands' in: ${commandsPath}`);

    if (!fs.existsSync(commandsPath)) {
        console.log("⚠️ La cartella non esiste in __dirname. Tento con il percorso relativo di root...");
        const alternativo = path.resolve("./commands");
        console.log(`🔎 [DEBUG] Provo percorso alternativo: ${alternativo}`);
        if (fs.existsSync(alternativo)) {
            console.log("✅ Trovata con percorso alternativo!");
        }
    }

    try {
        if (fs.existsSync(commandsPath)) {
            const allItems = fs.readdirSync(commandsPath);
            console.log("🔎 [DEBUG] File trovati nella cartella:", allItems);
            
            const files = allItems.filter(file => file.endsWith(".js"));
            for (const file of files) {
                const command = require(path.join(commandsPath, file));
                if (command.data && command.execute) {
                    client.commands.set(command.data.name, command);
                    console.log(`✅ Caricato: /${command.data.name}`);
                }
            }
        }
    } catch (error) {
        console.error("❌ Errore lettura comandi:", error);
    }

    console.log("-----------------------------------------");
    console.log(`📦 Comandi caricati: ${client.commands.size}`);
    console.log("-----------------------------------------");
};
