const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = async function deployCommands() {
    console.log("-----------------------------------------");
    console.log("🔄 Preparazione dei comandi per il deploy su Discord...");
    console.log("-----------------------------------------");

    const commands = [];
    const commandsPath = path.join(process.cwd(), "commands");

    if (!fs.existsSync(commandsPath)) {
        console.log("⚠️ Impossibile eseguire il deploy: cartella 'commands' non trovata.");
        return;
    }

    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of files) {
        try {
            const command = require(path.join(commandsPath, file));
            
            if (command.data) {
                commands.push(command.data.toJSON());
                console.log(`📌 Pronto per il server: /${command.data.name}`);
            }
        } catch (error) {
            console.error(`❌ Errore nella lettura di ${file} per il deploy API:`, error);
        }
    }

    if (commands.length === 0) {
        console.log("⚠️ Nessun comando valido trovato. Invio annullato.");
        return;
    }

    // Inizializziamo la connessione REST con Discord usando la v10 delle API
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log(`🚀 Invio di ${commands.length} comandi al server Discord...`);

        // Registrazione immediata tramite Guild ID (Server ID)
        await rest.put(
            Routes.applicationGuildCommands(
                "1527327515511881739", // Il tuo CLIENT_ID aggiornato
                "1505173045269233736"  // Il tuo GUILD_ID del server
            ),
            { body: commands }
        );

        console.log("-----------------------------------------");
        console.log(`✅ Sincronizzazione completata! ${commands.length} comandi inseriti nel server.`);
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("❌ Errore critico durante la registrazione dei comandi su Discord API:", error);
    }
};
