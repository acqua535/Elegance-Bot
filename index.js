const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

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
    console.warn("⚠️ La libreria 'mongoose' non è installata.");
}

if (mongoose && mongoUri) {
    console.log("🍃 Avvio connessione a MongoDB...");
    mongoose.connect(mongoUri)
        .then(() => {
            console.log("🍃 Connessione a MongoDB completata con successo!");
        })
        .catch((err) => {
            console.error("❌ Errore durante la connessione a MongoDB:", err.message);
        });
} else if (!mongoUri) {
    console.warn("⚠️ MONGO_URI non trovata nelle variabili d'ambiente!");
}

// --- CARICAMENTO MODULI DI SISTEMA ---
function loadSafe(pathModule) {
    try {
        return require(pathModule);
    } catch (e) {
        try {
            return require(`./commands/${pathModule.replace('./', '')}`);
        } catch (err) {
            console.warn(`[INDEX] Modulo opzionale non trovato: ${pathModule}`);
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
    console.log(`⚜️ Bot connesso con successo come: ${client.user.tag}`);

    if (typeof deployCommands === "function") await deployCommands();
    if (typeof loadCommands === "function") loadCommands(client);

    if (entry && typeof entry.initEvents === "function") {
        console.log("[INDEX] 👤 Avvio dei listener per Entry System (Benvenuto/Addio/JailCard)...");
        entry.initEvents(client);
    }
    if (logSystem && typeof logSystem.initEvents === "function") logSystem.initEvents(client);
    if (typeof countingSystem === "function") countingSystem(client);
    if (antiLink && typeof antiLink.initEvents === "function") antiLink.initEvents(client);
    
    if (stickyEvents && typeof stickyEvents.initEvents === "function") {
        console.log("[INDEX] 📌 Avvio del listener per eventi Sticky...");
        stickyEvents.initEvents(client);
    }

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
            console.log(`[INDEX] 📊 Ripristinati ${activePolls.length} sondaggi attivi.`);
        }
    } catch (err) {
        console.error("❌ Errore nel ripristino dei sondaggi:", err);
    }

    console.log("📦 Inizializzazione completata e Bot totalmente operativo!");
});

// --- GESTIONE INTERAZIONI ---
client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            console.log(`[COMMAND] Rilevato comando: /${interaction.commandName} da @${interaction.user.tag}`);
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`[COMMAND] ❌ Comando non trovato in Collection: /${interaction.commandName}`);
                return interaction.reply({ content: "❌ Comando non trovato.", flags: MessageFlags.Ephemeral });
            }
            await command.execute(interaction);
            return;
        }

        if (interaction.isModalSubmit()) {
            console.log(`[MODAL] Rilevato Modal Submit con customId: "${interaction.customId}" da @${interaction.user.tag}`);
            
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

        if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
            if (typeof buttonHandler === "function") {
                await buttonHandler(interaction);
            }
            return;
        }

    } catch (error) {
        console.error("🚨 ERRORE INTERAZIONE GLOBALE:", error);
        const errorMessage = "❌ Si è verificato un errore imprevisto durante l'esecuzione.";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});

// --- SISTEMA ANTI-CRASH ---
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ [ANTI-CRASH] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("⚠️ [ANTI-CRASH] Uncaught Exception:", err);
});

client.login(process.env.TOKEN);
                
