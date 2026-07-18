const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

// ==========================================
// FIX DISCLOUD: CREAZIONE AUTOMATICA CARTELLA
// ==========================================
const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) {
    console.log("📂 [FIX] Cartella 'commands' non trovata su Discloud. Creazione in corso...");
    fs.mkdirSync(commandsPath);
}

// ==========================
// CLIENT
// ==========================
const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// ==========================
// HANDLERS
// ==========================
const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand"); 
const ticket = require("./ticket");
const buttonHandler = require("./buttonHandler");
const verify = require("./verify");

// ==========================
// AVVIO GENERALE DEI COMANDI
// ==========================
(async () => {
    try {
        await deployCommands(); 
        loadCommands(client);   
        
        console.log("📦 Comandi caricati in memoria locale:", client.commands.size);
    } catch (error) {
        console.error("❌ Errore durante l'inizializzazione dei comandi:", error);
    }
})();

// ==========================
// ERROR SYSTEM
// ==========================
process.on(
    "unhandledRejection",
    error => {
        console.error("❌ Unhandled Promise:", error);
    }
);

process.on(
    "uncaughtException",
    error => {
        console.error("❌ Uncaught Exception:", error);
    }
);

// ==========================
// READY SYSTEM (AGGIORNATO)
// ==========================
// Sostituito 'ready' con 'clientReady' per rimuovere il deprecation warning
client.once(
    "clientReady",
    async (readyClient) => {
        console.log(`⚜️ Elegance-Bot online come ${readyClient.user.tag}`);

        readyClient.user.setActivity(
            "Elegance Community",
            { type: 3 } // Type 3 corrisponde a "Watching"
        );
    }
);

// ==========================
// INTERACTION ROUTER
// ==========================
client.on(
    "interactionCreate",
    async interaction => {
        try {
            // ==========================
            // SLASH COMMANDS
            // ==========================
            if(interaction.isChatInputCommand()){
                const command = client.commands.get(interaction.commandName);

                if(!command){
                    console.log("❌ Comando non trovato:", interaction.commandName);
                    return;
                }

                try {
                    await command.execute(interaction);
                } catch(error){
                    console.error("❌ Errore comando:", error);

                    if(!interaction.replied && !interaction.deferred){
                        await interaction.reply({
                            content: "❌ Errore durante l'esecuzione del comando.",
                            ephemeral: true
                        }).catch(()=>{});
                    }
                }
                return;
            }

            // ==========================
            // BUTTONS
            // ==========================
            if(interaction.isButton()){
                await buttonHandler(interaction);
                return;
            }

            // ==========================
            // SELECT MENUS
            // ==========================
            if(interaction.isStringSelectMenu()){
                // Apertura ticket
                if(interaction.customId === "ticket_category"){
                    await ticket.categoryHandler(interaction);
                    return;
                }
                if(interaction.customId === "ticket_manage"){
                    await ticket.router(interaction);
                    return;
                }
                // Priorità ticket
                if(interaction.customId === "ticket_priority"){
                    await ticket.router(interaction);
                    return;
                }
            }

            // ==========================
            // MODALS
            // ==========================
            if(interaction.isModalSubmit()){
                if(interaction.customId === "verify_modal"){
                    await verify.modalHandler(interaction);
                    return;
                }
            }

        } catch(error){
            console.error("❌ Errore interaction:", error);

            if(!interaction.replied && !interaction.deferred){
                await interaction.reply({
                    content: "❌ Si è verificato un errore.",
                    ephemeral: true
                }).catch(()=>{});
            }
        }
    }
);

// ==========================
// TOKEN CHECK
// ==========================
console.log(
    "TOKEN PRESENTE:",
    process.env.TOKEN ? "SI" : "NO"
);

// ==========================
// LOGIN
// ==========================
client.login(process.env.TOKEN);
