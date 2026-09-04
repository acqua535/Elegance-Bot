// ==========================================
// FILE: index.js (MEGA SUPER FIXATO + ANTI-CRASH TOTALE)
// ==========================================
const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

console.log("==================================================");
console.log("🚀 [BOOT] Avvio del bot in corso...");
console.log("==================================================");

// --- GESTIONE E PULIZIA MONGO_URI ---
let mongoUri = process.env.MONGO_URI;
if (mongoUri && mongoUri.includes("MONGO_URI=")) {
    mongoUri = mongoUri.split("MONGO_URI=")[1].trim();
}

// --- CONNESSIONE MONGODB ---
let mongoose = null;
try {
    mongoose = require("mongoose");
} catch (e) {
    console.warn("⚠️ [DB] La libreria 'mongoose' non è installata.");
}

if (mongoose && mongoUri) {
    console.log("🍃 [DB] Connessione a MongoDB in corso...");
    mongoose.connect(mongoUri)
        .then(() => {
            console.log("🍃 [DB] Connessione a MongoDB completata con successo!");
        })
        .catch((err) => {
            console.error("❌ [DB] Errore connessione MongoDB:", err.message);
        });
} else if (!mongoUri) {
    console.warn("⚠️ [DB] MONGO_URI non trovata nelle variabili d'ambiente!");
}

// --- CARICAMENTO MODULI DI SISTEMA ---
function loadSafe(pathModule) {
    try {
        return require(pathModule);
    } catch (e) {
        try {
            return require(`./commands/${pathModule.replace('./', '')}`);
        } catch (err) {
            return {};
        }
    }
}

const loadCommands = loadSafe("./commandHandler");
const deployCommands = loadSafe("./deployCommand");
const buttonHandler = loadSafe("./buttonHandler");
const entry = loadSafe("./entry");
const logSystem = loadSafe("./logSystem"); 
const countingSystem = loadSafe("./countingSystem"); 
const antiLink = loadSafe("./antiLink");
const stickyEvents = loadSafe("./stickyEvents");
const { Poll } = require("./Setup");
const pollModule = loadSafe("./poll");

// --- INIZIALIZZAZIONE CLIENT DISCORD ---
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
    ],
    rest: {
        timeout: 30000
    }
});

client.commands = new Collection();

// --- EVENTO READY ---
client.once("clientReady", async () => {
    console.log("--------------------------------------------------");
    console.log(`⚜️ [READY] Bot connesso come: ${client.user.tag}`);
    console.log("--------------------------------------------------");

    if (typeof deployCommands === "function") await deployCommands();
    if (typeof loadCommands === "function") loadCommands(client);

    if (entry && typeof entry.initEvents === "function") entry.initEvents(client);
    if (logSystem && typeof logSystem.initEvents === "function") logSystem.initEvents(client);
    if (typeof countingSystem === "function") countingSystem(client);
    if (antiLink && typeof antiLink.initEvents === "function") antiLink.initEvents(client);
    if (stickyEvents && typeof stickyEvents.initEvents === "function") stickyEvents.initEvents(client);

    // --- RIPRISTINO SONDAGGI ATTIVI AL RIAVVIO ---
    try {
        const now = Date.now();
        const activePolls = await Poll.find({ ended: false });
        for (const poll of activePolls) {
            const timeLeft = poll.endTime - now;
            if (timeLeft <= 0) {
                if (pollModule && typeof pollModule.chiudiSondaggio === "function") {
                    await pollModule.chiudiSondaggio(client, poll.messageId);
                }
            } else {
                setTimeout(() => {
                    if (pollModule && typeof pollModule.chiudiSondaggio === "function") {
                        pollModule.chiudiSondaggio(client, poll.messageId);
                    }
                }, timeLeft);
            }
        }
        if (activePolls.length > 0) {
            console.log(`[POLL-SYSTEM] 📊 Ripristinati ${activePolls.length} sondaggi attivi.`);
        }
    } catch (err) {
        console.error("❌ [POLL-SYSTEM] Errore ripristino sondaggi:", err);
    }

    console.log("📦 [READY] Inizializzazione completata e Bot operativo!");
});

// --- GESTIONE INTERAZIONI ---
client.on("interactionCreate", async (interaction) => {
    try {
        // 1. GESTIONE COMANDI SLASH (/)
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return interaction.reply({ content: "❌ Comando non trovato.", flags: MessageFlags.Ephemeral }).catch(() => {});
            }
            await command.execute(interaction);
            return;
        }

        // 2. GESTIONE DIRETTA BOTTONE JAIL CARD ANNOUNCEMENT
        if (interaction.isButton() && interaction.customId === "jail_card_announcement_btn") {
            const jailCard = loadSafe("./jailCard");
            if (jailCard && typeof jailCard.buttonHandler === "function") {
                await jailCard.buttonHandler(interaction);
                return;
            }
        }

        // 3. GESTIONE MODAL SUBMIT
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "sticky_modal_create") {
                if (stickyEvents && typeof stickyEvents.handleInteraction === "function") {
                    return await stickyEvents.handleInteraction(interaction);
                }
            }
            if (interaction.customId.startsWith("verify_modal_")) {
                const verifyCmd = client.commands.get("verify");
                if (verifyCmd && verifyCmd.modalHandler) return await verifyCmd.modalHandler(interaction);
            }
            if (interaction.customId === "apply_form_modal") {
                const applyCmd = client.commands.get("apply");
                if (applyCmd && applyCmd.modalHandler) return await applyCmd.modalHandler(interaction);
            }
            if (interaction.customId.startsWith("ticket_modal_")) {
                const ticketCmd = client.commands.get("ticket");
                if (ticketCmd && ticketCmd.modalHandler) return await ticketCmd.modalHandler(interaction);
            }
            if (interaction.customId.startsWith("submit_review_modal_")) {
                const ticketModule = loadSafe("./ticket");
                if (ticketModule && typeof ticketModule.handleReviewSubmit === "function") {
                    return await ticketModule.handleReviewSubmit(interaction);
                }
            }
        }

        // 4. GESTIONE GENERALE PULSANTI / SELECT MENU / ALTRE INTERAZIONI
        if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
            if (typeof buttonHandler === "function") {
                await buttonHandler(interaction);
            }
            return;
        }

    } catch (error) {
        console.error("🚨 [INTERACTION ERROR]:", error);
        const errorMessage = "❌ Si è verificato un errore imprevisto durante l'esecuzione dell'interazione.";
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
            } else {
                await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        } catch (err) {
            // Ignora se l'interazione è scaduta o già gestita
        }
    }
});

// --- SISTEMA ANTI-CRASH TOTALE (PREVIENE QUALSIASI CHIUSURA ACCIDENTALE) ---
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ [ANTI-CRASH] Unhandled Rejection intercettata:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("⚠️ [ANTI-CRASH] Uncaught Exception intercettata:", err);
});

client.login(process.env.TOKEN);
