// ==========================================
// FILE: index.js (VERSIONE DIAGNOSTICA ULTRADEBUG)
// ==========================================
const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

console.log("\n================ 🔍 [ DIAGNOSTICA AVVIO BOT ] ================");

// 1. ISPEZIONE FILE SYSTEM E PACKAGE.JSON SUL SERVER
try {
    const pkgPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
        const pkgData = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        console.log(`📂 [DEBUG-FS] package.json trovato nella root!`);
        console.log(`   👉 Dipendenze trovate nel file:`, Object.keys(pkgData.dependencies || {}));
    } else {
        console.error("❌ [DEBUG-FS] File package.json NON trovato nella directory corrente:", process.cwd());
    }
} catch (fsErr) {
    console.error("❌ [DEBUG-FS] Errore nella lettura di package.json:", fsErr.message);
}

// 2. ISPEZIONE VARIABILI D'AMBIENTE (ENV)
const envKeys = Object.keys(process.env).filter(k => !k.startsWith("npm_") && !k.startsWith("NODE_"));
console.log("🔑 [DEBUG-ENV] Chiavi ENV caricate sul server:", envKeys);

const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
    const maskedUri = mongoUri.replace(/\/\/(.*):(.*)@/, "//***:***@");
    console.log(`✅ [DEBUG-ENV] MONGO_URI trovata! (Lunghezza: ${mongoUri.length} car., Formato: ${maskedUri})`);
} else {
    console.error("❌ [DEBUG-ENV] MONGO_URI è UNDEFINED o VUOTA! Discloud non la sta passando all'app.");
}

// 3. TENTATIVO CARICAMENTO MONGOOSE CON REPORT DETTAGLIATO
let mongoose = null;
try {
    mongoose = require("mongoose");
    console.log(`🍃 [DEBUG-MONGO] Modulo Mongoose CARICATO CORRETTAMENTE! Versione: v${mongoose.version}`);
} catch (reqErr) {
    console.error("❌ [DEBUG-MONGO] Impossibile caricare Mongoose!");
    console.error(`   👉 Codice Errore: ${reqErr.code}`);
    console.error(`   👉 Messaggio Errore: ${reqErr.message}`);
}

// 4. TENTATIVO DI CONNESSIONE A MONGO DB
if (mongoose && mongoUri) {
    console.log("🔄 [DEBUG-MONGO] Avvio connessione a MongoDB...");
    
    mongoose.connection.on("connecting", () => console.log("⏳ [MONGO-EVENT] Connessione in corso..."));
    mongoose.connection.on("connected", () => console.log("🍃 [MONGO-EVENT] ✅ Connesso con successo a MongoDB!"));
    mongoose.connection.on("error", (err) => console.error("❌ [MONGO-EVENT] Errore connessione:", err.message));
    mongoose.connection.on("disconnected", () => console.warn("⚠️ [MONGO-EVENT] Disconnesso da MongoDB."));

    mongoose.connect(mongoUri)
        .then(() => console.log("🎉 [DEBUG-MONGO] Promessa mongoose.connect() risolta con successo!"))
        .catch((err) => console.error("💥 [DEBUG-MONGO] Fallimento promessa mongoose.connect():", err));
} else {
    if (!mongoose) console.warn("⚠️ [DEBUG-MONGO] Connessione saltata: Mongoose non è installato sul server.");
    if (!mongoUri) console.warn("⚠️ [DEBUG-MONGO] Connessione saltata: MONGO_URI mancante.");
}

console.log("===============================================================\n");

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

client.once("clientReady", async () => {
    console.log(`⚜️ Bot connesso con successo come: ${client.user.tag}`);

    if (typeof deployCommands === "function") await deployCommands();
    if (typeof loadCommands === "function") loadCommands(client);

    if (logSystem && typeof logSystem.initEvents === "function") logSystem.initEvents(client);
    if (typeof countingSystem === "function") countingSystem(client);
    if (antiLink && typeof antiLink.initEvents === "function") antiLink.initEvents(client);
    
    if (stickyEvents && typeof stickyEvents.initEvents === "function") {
        console.log("[INDEX] 📌 Avvio del listener per eventi Sticky...");
        stickyEvents.initEvents(client);
    }

    console.log("📦 Inizializzazione completata e Bot totalmente operativo!");
});

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

client.on("guildMemberAdd", async (member) => {
    try {
        if (entry && typeof entry.handleMemberAdd === "function") await entry.handleMemberAdd(member);
    } catch (error) {
        console.error("❌ Errore guildMemberAdd:", error);
    }
});

client.on("guildMemberRemove", async (member) => {
    try {
        if (entry && typeof entry.handleMemberRemove === "function") await entry.handleMemberRemove(member);
    } catch (error) {
        console.error("❌ Errore guildMemberRemove:", error);
    }
});

process.on("unhandledRejection", (reason) => {
    console.error("⚠️ [ANTI-CRASH] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("⚠️ [ANTI-CRASH] Uncaught Exception:", err);
});

client.login(process.env.TOKEN);
        
