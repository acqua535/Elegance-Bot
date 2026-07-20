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

    const targetCommands = [
        "collab.js", "daily-reward.js", "embed.js", "horror.js", 
        "minigame.js", "modify-suggest.js", "partner.js", "say.js", 
        "sponsor.js", "suggest.js", "unwarn.js", "warn.js", "warnings.js"
    ];

    const filesToDeploy = new Map();

    // Controlla in 'commands'
    if (fs.existsSync(commandsPath)) {
        fs.readdirSync(commandsPath).forEach(file => {
            if (targetCommands.includes(file)) filesToDeploy.set(file, path.join(commandsPath, file));
        });
    }

    // Controlla in root
    fs.readdirSync(rootPath).forEach(file => {
        if (targetCommands.includes(file) && !filesToDeploy.has(file)) {
            filesToDeploy.set(file, path.join(rootPath, file));
        }
    });

    for (const [file, filePath] of filesToDeploy.entries()) {
        try {
            const command = require(filePath);
            if (command.data) {
                commands.push(command.data.toJSON());
                console.log(`📌 Pronto per Discord API: /${command.data.name}`);
            }
        } catch (error) {
            console.error(`❌ Errore lettura ${file} per API:`, error);
        }
    }

    if (commands.length === 0) {
        console.log("⚠️ Nessun comando trovato nelle posizioni specificate. Deploy annullato.");
        return;
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log(`🚀 Invio di ${commands.length} comandi al server Discord...`);

        await rest.put(
            Routes.applicationGuildCommands(
                "1527327515511881739", 
                "1505173045269233736"  
            ),
            { body: commands }
        );

        console.log("-----------------------------------------");
        console.log(`✅ Sincronizzazione completata! ${commands.length} comandi inseriti.`);
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("❌ Errore critico durante il deploy su Discord API:", error);
    }
};
