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

    // LISTA UFFICIALE (Ho rimosso horror.js per sempre)
    const targetCommands = [
        "collab.js", "daily-reward.js", "embed.js", 
        "minigame.js", "modify-suggest.js", "partner.js", "say.js", 
        "sponsor.js", "suggest.js", "ticket.js", "unwarn.js", "warn.js", "warnings.js"
    ];

    const filesToDeploy = new Map();

    // 1. Controlla cartella 'commands'
    if (fs.existsSync(commandsPath)) {
        fs.readdirSync(commandsPath).forEach(file => {
            if (targetCommands.includes(file)) filesToDeploy.set(file, path.join(commandsPath, file));
        });
    }

    // 2. Controlla nella root
    fs.readdirSync(rootPath).forEach(file => {
        if (targetCommands.includes(file) && !filesToDeploy.has(file)) {
            filesToDeploy.set(file, path.join(rootPath, file));
        }
    });

    // 3. Caricamento forzato
    for (const [file, filePath] of filesToDeploy.entries()) {
        try {
            // Pulisco la cache per evitare che Discord riceva versioni vecchie
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            
            if (command.data) {
                commands.push(command.data.toJSON());
                console.log(`📌 Pronto per Discord API: /${command.data.name}`);
            } else {
                console.warn(`⚠️ Saltato (data mancante): ${file}`);
            }
        } catch (error) {
            console.error(`❌ Errore critico nel leggere ${file}:`, error);
        }
    }

    if (commands.length === 0) {
        console.log("⚠️ Nessun comando valido trovato. Deploy annullato.");
        return;
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log(`🚀 Invio di ${commands.length} comandi a Discord...`);

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
