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
    const commandsPath = path.join(rootPath, "commands");

    // File di sistema da ignorare automaticamente (non sono comandi slash)
    const ignoredFiles = [
        "index.js", "main.js", "commandHandler.js", 
        "deployCommand.js", "deploy-commands.js", "buttonHandler.js"
    ];

    const filesToDeploy = new Map();

    // 1. Cerca prima dentro la cartella 'commands'
    if (fs.existsSync(commandsPath)) {
        fs.readdirSync(commandsPath)
            .filter(file => file.endsWith(".js") && !ignoredFiles.includes(file))
            .forEach(file => {
                filesToDeploy.set(file, path.join(commandsPath, file));
            });
    }

    // 2. Cerca nella root (se non è già stato preso da /commands)
    fs.readdirSync(rootPath)
        .filter(file => file.endsWith(".js") && !ignoredFiles.includes(file))
        .forEach(file => {
            if (!filesToDeploy.has(file)) {
                filesToDeploy.set(file, path.join(rootPath, file));
            }
        });

    // 3. Caricamento dinamico e preparazione dei comandi
    for (const [file, filePath] of filesToDeploy.entries()) {
        try {
            // Pulisce la cache per inviare sempre la versione più aggiornata
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            
            if (command && command.data && typeof command.data.toJSON === "function") {
                commands.push(command.data.toJSON());
                console.log(`📌 Pronto per Discord API: /${command.data.name} (${path.relative(rootPath, filePath)})`);
            } else {
                console.warn(`⚠️ Saltato (non è un comando valido o manca 'data'): ${file}`);
            }
        } catch (error) {
            console.error(`❌ Errore critico nel leggere ${file}:`, error.message);
        }
    }

    if (commands.length === 0) {
        console.log("⚠️ Nessun comando valido trovato. Deploy annullato.");
        return;
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log(`🚀 Invio di ${commands.length} comandi a Discord...`);

        // Sincronizzazione immediata per il Server
        await rest.put(
            Routes.applicationGuildCommands(
                "1527327515511881739", // ID del Bot
                "1505173045269233736"  // ID del Server Elegance
            ),
            { body: commands }
        );

        console.log("-----------------------------------------");
        console.log(`✅ Sincronizzazione completata! ${commands.length} comandi inviati.`);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("❌ Errore critico durante il deploy API:", error);
    }
};
