// ==========================================
// FILE: index.js (VERSIONE PULITA - SENZA MEMORY & PARTNERDB)
// ==========================================
const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require("discord.js");
require("dotenv").config();

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
                
