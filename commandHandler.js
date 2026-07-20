const fs = require("fs");
const path = require("path");

module.exports = function loadCommands(client) {
    console.log("🔥 [DEBUG MOD] Avvio diagnosi comandi...");
    const rootPath = process.cwd();
    
    // Lista forzata, niente "targetCommands" che ci nascondono file
    // Mettiamo qui dentro TUTTI i file che devono essere comandi
    const files = ["ticket.js", "collab.js", "embed.js", "minigame.js", "modify-suggest.js", "partner.js", "say.js", "sponsor.js", "suggest.js", "unwarn.js", "warn.js", "warnings.js"];

    files.forEach(file => {
        const filePath = path.join(rootPath, file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ FILE NON TROVATO: ${file} (Controlla se è nella root!)`);
            return;
        }

        try {
            // Elimina la cache FORZATAMENTE
            delete require.cache[require.resolve(filePath)];
            
            const command = require(filePath);

            // CONTROLLO DI VERITA'
            if (!command.data) {
                throw new Error(`Manca l'oggetto 'data' in ${file}`);
            }
            if (!command.execute) {
                throw new Error(`Manca la funzione 'execute' in ${file}`);
            }

            client.commands.set(command.data.name, command);
            console.log(`✅ CARICATO CORRETTAMENTE: /${command.data.name}`);

        } catch (err) {
            console.error("--------------------------------------------------");
            console.error(`🚨 ERRORE FATALE NEL FILE: ${file}`);
            console.error(`📝 Dettaglio: ${err.message}`);
            console.error(`📍 Stack Trace: ${err.stack}`);
            console.error("--------------------------------------------------");
        }
    });

    console.log(`📦 Caricamento terminato. Comandi pronti: ${client.commands.size}`);
};
