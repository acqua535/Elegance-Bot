const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require("discord.js");

require("dotenv").config();

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
const ticket = require("./ticket");
const buttonHandler = require("./buttonHandler");
const verify = require("./verify");

// ==========================
// LOAD COMMANDS
// ==========================
loadCommands(client);

console.log(
    "📦 Comandi caricati in memoria:",
    client.commands.size
);

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
// READY & SYNC COMMANDS
// ==========================
// Usiamo 'clientReady' come consigliato da Discord v14/v15
client.once(
    "clientReady",
    async (readyClient) => {
        console.log(`⚜️ Elegance-Bot online come ${readyClient.user.tag}`);

        readyClient.user.setActivity(
            "Elegance Community",
            { type: 3 }
        );

        // --- INIZIO LOGICA DI SINCRONIZZAZIONE DISCORD ---
        try {
            console.log("🔄 Avvio sincronizzazione dei comandi Slash con Discord...");
            
            // Estrae i dati JSON da tutti i 18 comandi caricati
            const commandsData = [];
            readyClient.commands.forEach(cmd => {
                if (cmd.data) {
                    commandsData.push(cmd.data.toJSON());
                } else if (cmd.toJSON) {
                    commandsData.push(cmd.toJSON());
                }
            });

            if (commandsData.length > 0) {
                const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

                // Registra i comandi globalmente su Discord usando l'ID del bot dinamico
                await rest.put(
                    Routes.applicationCommands(readyClient.user.id),
                    { body: commandsData }
                );

                console.log(`✅ Successo! ${commandsData.length} comandi Slash sincronizzati globalmente con Discord!`);
            } else {
                console.log("⚠️ Nessun dato comando valido trovato per la sincronizzazione.");
            }
        } catch (error) {
            console.error("❌ Errore durante la registrazione dei comandi su Discord:", error);
        }
        // --- FINE LOGICA DI SINCRONIZZAZIONE ---
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
                            content: "❌ Errore durante il comando.",
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
                    
