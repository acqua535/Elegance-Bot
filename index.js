// ==========================================
// FILE: index.js (MEGA SUPER FIXATO + LOG EXTRA)
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
    console.log("[CONFIG] 🧹 MONGO_URI pulita da prefissi ridondanti.");
}

// --- CONNESSIONE MONGODB ---
let mongoose = null;
try {
    mongoose = require("mongoose");
} catch (e) {
    console.warn("⚠️ [DB] La libreria 'mongoose' non è installata.");
}

if (mongoose && mongoUri) {
    console.log("🍃 [DB] Tentativo di connessione a MongoDB in corso...");
    mongoose.connect(mongoUri)
        .then(() => {
            console.log("🍃 [DB] Connessione a MongoDB completata con successo!");
        })
        .catch((err) => {
            console.error("❌ [DB] Errore durante la connessione a MongoDB:", err.message);
        });
} else if (!mongoUri) {
    console.warn("⚠️ [DB] MONGO_URI non trovata nelle variabili d'ambiente!");
}

// --- CARICAMENTO MODULI DI SISTEMA ---
function loadSafe(pathModule) {
    try {
        const mod = require(pathModule);
        console.log(`[LOADER] ✅ Modulo caricato: ${pathModule}`);
        return mod;
    } catch (e) {
        try {
            const mod = require(`./commands/${pathModule.replace('./', '')}`);
            console.log(`[LOADER] ✅ Modulo caricato da ./commands/: ${pathModule}`);
            return mod;
        } catch (err) {
            console.warn(`[LOADER] ⚠️ Modulo opzionale non trovato: ${pathModule}`);
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
    console.log(`⚜️ [READY] Bot connesso con successo come: ${client.user.tag} (ID: ${client.user.id})`);
    console.log("--------------------------------------------------");

    if (typeof deployCommands === "function") {
        console.log("[DEPLOY] 🔄 Avvio sincronizzazione comandi slash API...");
        await deployCommands();
    }
    
    if (typeof loadCommands === "function") {
        console.log("[COMMANDS] 📂 Caricamento comandi nella Collection...");
        loadCommands(client);
    }

    if (entry && typeof entry.initEvents === "function") {
        console.log("[INDEX] 👤 Avvio dei listener per Entry System (Benvenuto/Addio/JailCard)...");
        entry.initEvents(client);
    }
    
    if (logSystem && typeof logSystem.initEvents === "function") {
        console.log("[INDEX] 📝 Avvio del sistema di Log...");
        logSystem.initEvents(client);
    }
    
    if (typeof countingSystem === "function") {
        console.log("[INDEX] 🔢 Avvio del Counting System...");
        countingSystem(client);
    }
    
    if (antiLink && typeof antiLink.initEvents === "function") {
        console.log("[INDEX] 🛡️ Avvio del sistema Anti-Link...");
        antiLink.initEvents(client);
    }
    
    if (stickyEvents && typeof stickyEvents.initEvents === "function") {
        console.log("[INDEX] 📌 Avvio del listener per eventi Sticky...");
        stickyEvents.initEvents(client);
    }

    // --- RIPRISTINO SONDAGGI ATTIVI AL RIAVVIO ---
    try {
        const now = Date.now();
        const activePolls = await Poll.find({ ended: false });
        console.log(`[POLL-SYSTEM] 🔍 Controllo sondaggi attivi nel database: ${activePolls.length} trovati.`);
        
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
            console.log(`[POLL-SYSTEM] 📊 Ripristinati con successo ${activePolls.length} sondaggi attivi.`);
        }
    } catch (err) {
        console.error("❌ [POLL-SYSTEM] Errore nel ripristino dei sondaggi:", err);
    }

    console.log("==================================================");
    console.log("📦 [READY] Inizializzazione completata e Bot totalmente operativo!");
    console.log("==================================================");
});

// --- GESTIONE INTERAZIONI ---
client.on("interactionCreate", async (interaction) => {
    try {
        // 1. GESTIONE COMANDI SLASH (/)
        if (interaction.isChatInputCommand()) {
            console.log(`[INTERACTION] 💬 Comando ricevuto: /${interaction.commandName} da @${interaction.user.tag} (ID: ${interaction.user.id})`);
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`[INTERACTION] ❌ Comando non trovato nella Collection: /${interaction.commandName}`);
                return interaction.reply({ content: "❌ Comando non trovato.", flags: MessageFlags.Ephemeral });
            }
            await command.execute(interaction);
            console.log(`[INTERACTION] ✅ Esecuzione comando /${interaction.commandName} completata.`);
            return;
        }

        // 2. GESTIONE DIRETTA BOTTONE JAIL CARD ANNOUNCEMENT (FIX DEFINITIVO)
        if (interaction.isButton() && interaction.customId === "jail_card_announcement_btn") {
            console.log(`[BUTTON-HANDLER] 🎁 Click rilevato su 'jail_card_announcement_btn' da @${interaction.user.tag} (ID: ${interaction.user.id})`);
            const jailCard = loadSafe("./jailCard");
            if (jailCard && typeof jailCard.buttonHandler === "function") {
                await jailCard.buttonHandler(interaction);
                console.log(`[BUTTON-HANDLER] ✅ Invio DM Jail Card eseguito con successo per @${interaction.user.tag}`);
                return;
            } else {
                console.warn(`[BUTTON-HANDLER] ⚠️ Modulo jailCard o funzione buttonHandler non trovati!`);
            }
        }

        // 3. GESTIONE MODAL SUBMIT
        if (interaction.isModalSubmit()) {
            console.log(`[MODAL] 📝 Modal Submit ricevuto con customId: "${interaction.customId}" da @${interaction.user.tag}`);
            
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
            console.log(`[INTERACTION] 🔘 Interazione UI generica ricevuta -> CustomID: "${interaction.customId}" (Tipo: ${interaction.type}) da @${interaction.user.tag}`);
            if (typeof buttonHandler === "function") {
                await buttonHandler(interaction);
            }
            return;
        }

    } catch (error) {
        console.error("🚨 [CRITICAL ERROR] Errore critico durante la gestione dell'interazione:", error);
        const errorMessage = "❌ Si è verificato un errore imprevisto durante l'esecuzione dell'interazione.";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});

// --- SISTEMA ANTI-CRASH ---
process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ [ANTI-CRASH] Unhandled Rejection rilevata:", reason);
});

process.on("uncaughtException", (err, origin) => {
    console.error("⚠️ [ANTI-CRASH] Uncaught Exception rilevata:", err, "Origine:", origin);
});

// --- TEST DIAGNOSTICO INGRESSI ---
client.on("guildMemberAdd", (member) => {
    console.log(`👤 [DIAGNOSTICO MEMBRO] Nuovo utente entrato nel server: ${member.user.tag} (ID: ${member.id})`);
});

client.login(process.env.TOKEN);
