// ==========================================
// FILE: index.js (BLINDATO & ANTI-CRASH)
// ==========================================
const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require("discord.js");
require("dotenv").config();

// Helper per caricare i moduli in modo sicuro
function loadSafe(path) {
    try {
        return require(path);
    } catch (e) {
        try {
            return require(`./commands/${path.replace('./', '')}`);
        } catch (err) {
            console.warn(`[INDEX] Modulo opzionale non trovato: ${path}`);
            return {};
        }
    }
}

// Caricamento sicuro dei moduli di sistema
const loadCommands = loadSafe("./commandHandler");
const deployCommands = loadSafe("./deployCommand");
const buttonHandler = loadSafe("./buttonHandler");
const entry = loadSafe("./entry");
const logSystem = loadSafe("./logSystem"); 
const countingSystem = loadSafe("./countingSystem"); 
const antiLink = loadSafe("./antiLink");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildBans
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember
    ]
});

client.commands = new Collection();

// Evento Ready aggiornato per evitare warning di deprecazione
client.once("clientReady", async () => {
    console.log(`⚜️  Bot connesso con successo come: ${client.user.tag}`);

    // Deploy delle API Discord e caricamento dinamico dei comandi
    if (typeof deployCommands === "function") {
        await deployCommands();
    }
    if (typeof loadCommands === "function") {
        loadCommands(client);
    }

    // Inizializzazione degli eventi per i vari moduli
    if (logSystem && typeof logSystem.initEvents === "function") {
        logSystem.initEvents(client);
    }
    
    if (typeof countingSystem === "function") {
        countingSystem(client);
    }

    if (antiLink && typeof antiLink.initEvents === "function") {
        antiLink.initEvents(client);
    }

    console.log("📦 Inizializzazione completata e Bot totalmente operativo!");
});

client.on("interactionCreate", async (interaction) => {
    try {
        // 1. GESTIONE SLASH COMMANDS
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return interaction.reply({
                    content: "❌ Comando non trovato o non configurato.",
                    flags: MessageFlags.Ephemeral
                });
            }
            await command.execute(interaction);
            return;
        }

        // 2. GESTIONE MODULI POP-UP (MODALS)
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith("verify_modal_")) {
                const verifyCmd = client.commands.get("verify");
                if (verifyCmd && verifyCmd.modalHandler) {
                    return await verifyCmd.modalHandler(interaction);
                }
            }

            if (interaction.customId === "apply_form_modal") {
                const applyCmd = client.commands.get("apply");
                if (applyCmd && applyCmd.modalHandler) {
                    return await applyCmd.modalHandler(interaction);
                }
            }

            if (interaction.customId.startsWith("ticket_modal_")) {
                const ticketCmd = client.commands.get("ticket");
                if (ticketCmd && ticketCmd.modalHandler) {
                    return await ticketCmd.modalHandler(interaction);
                }
            }
        }

        // 3. GESTIONE PULSANTI, MENU A TENDINA E MODALI GENERICI TRAMITE REGISTRY
        if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
            if (typeof buttonHandler === "function") {
                await buttonHandler(interaction);
            }
            return;
        }

    } catch (error) {
        console.error("🚨 ERRORE INTERAZIONE:", error);
        const errorMessage = "❌ Si è verificato un errore imprevisto durante l'esecuzione.";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});

// EVENTI ENTRATA ED USCITA UTENTI
client.on("guildMemberAdd", async (member) => {
    try {
        if (entry && typeof entry.handleMemberAdd === "function") await entry.handleMemberAdd(member);
    } catch (error) {
        console.error("❌ Errore durante l'evento guildMemberAdd:", error);
    }
});

client.on("guildMemberRemove", async (member) => {
    try {
        if (entry && typeof entry.handleMemberRemove === "function") await entry.handleMemberRemove(member);
    } catch (error) {
        console.error("❌ Errore durante l'evento guildMemberRemove:", error);
    }
});

// ==========================================
// SCUDO PROTEZIONE ANTI-CRASH GLOBALE
// ==========================================
process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ [PREVENITO CRASH] Unhandled Rejection detectata:", reason);
});

process.on("uncaughtException", (err, origin) => {
    console.error("⚠️ [PREVENITO CRASH] Uncaught Exception detectata:", err);
});

client.login(process.env.TOKEN);
            
