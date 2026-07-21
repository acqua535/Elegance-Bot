const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = async function deployCommands() {
    console.log("-----------------------------------------");
    console.log("🔄 Preparazione dei comandi per il deploy API...");
    console.log("-----------------------------------------");

    const commands = [];
    const rootPath = process.cwd();
    const commandsFolder = path.join(rootPath, "commands");

    // File di sistema e helper da non considerare mai come comandi slash
    const ignoredFiles = [
        "index.js", "main.js", "commandHandler.js", 
        "deployCommand.js", "deploy-commands.js", "buttonHandler.js",
        "config.js", "registry.js"
    ];

    // Utilizziamo un Map per garantire che ogni NOME DI COMANDO sia unico
    const uniqueCommandsMap = new Map();

    // Funzione di utilità per filtrare i file duplicati o temporanei
    const isValidFile = (file) => {
        if (!file.endsWith(".js")) return false;
        if (ignoredFiles.includes(file)) return false;
        // Filtra copie tipo "file (1).js", "file - Copia.js", ecc.
        if (/\s*\(\d+\)\.js$/.test(file) || file.includes(" - Copia")) return false;
        return true;
    };

    let filesToScan = [];

    // 1. Raccoglie prima i file dalla cartella /commands (priorità alta)
    if (fs.existsSync(commandsFolder)) {
        const subFiles = fs.readdirSync(commandsFolder).filter(isValidFile);
        subFiles.forEach(file => filesToScan.push(path.join(commandsFolder, file)));
    }

    // 2. Raccoglie i file dalla Root (solo se non già inclusi)
    const rootFiles = fs.readdirSync(rootPath).filter(isValidFile);
    rootFiles.forEach(file => filesToScan.push(path.join(rootPath, file)));

    // 3. Processa i file e applica la deduplica per nome comando
    for (const filePath of filesToScan) {
        try {
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            // Verifica che il file sia un vero comando Slash
            if (command && command.data && typeof command.data.toJSON === "function") {
                const commandName = command.data.name;

                // Se il comando non è ancora stato aggiunto, lo inserisce nel Map
                if (!uniqueCommandsMap.has(commandName)) {
                    uniqueCommandsMap.set(commandName, {
                        json: command.data.toJSON(),
                        file: path.basename(filePath)
                    });
                }
            }
        } catch (error) {
            // Ignora in silenzio moduli di supporto/funzioni (es. logSystem.js, ticketSystem.js)
        }
    }

    // Convertiamo il Map filtrato nell'array per le API
    for (const [name, info] of uniqueCommandsMap.entries()) {
        commands.push(info.json);
        console.log(`📌 Pronto per Discord API: /${name} (${info.file})`);
    }

    if (commands.length === 0) {
        console.log("⚠️ Nessun comando valido trovato per il deploy.");
        return;
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log(`🚀 Invio di ${commands.length} comandi univoci a Discord...`);

        await rest.put(
            Routes.applicationGuildCommands(
                "1527327515511881739", // ID del Bot
                "1505173045269233736"  // ID del Server Elegance
            ),
            { body: commands }
        );

        console.log("-----------------------------------------");
        console.log(`✅ Sincronizzazione completata! ${commands.length} comandi univoci inviati.`);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("❌ Errore critico durante il deploy API:", error);
    }
};
