const { Client, GatewayIntentBits, Collection, MessageFlags } = require("discord.js");
require("dotenv").config();

const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand");
const buttonHandler = require("./buttonHandler");
const entry = require("./entry");

// Inizializzazione Client con tutti i Intents necessari (inclusi GuildMembers per i Benvenuti)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Evento Ready: Avvio Bot, Deploy API e caricamento handler
client.once("ready", async () => {
    console.log(`⚜️  Bot connesso con successo come: ${client.user.tag}`);

    // 1. Esegue il Deploy dei Comandi API a Discord
    await deployCommands();

    // 2. Carica i comandi in memoria locale per la gestione delle interazioni
    loadCommands(client);

    console.log("📦 Inizializzazione completata e Bot totalmente operativo!");
});

// Evento InteractionCreate: Gestisce Slash Commands, Bottoni e Modal
client.on("interactionCreate", async (interaction) => {
    try {
        // --- 1. COMANDI SLASH ---
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

        // --- 2. MODAL SUBMIT (Modulo CAPTCHA Dinamico) ---
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith("verify_modal_")) {
                const verifyCmd = client.commands.get("verify");
                if (verifyCmd && verifyCmd.modalHandler) {
                    return await verifyCmd.modalHandler(interaction);
                }
            }
        }

        // --- 3. BOTTONI E MENU A TENDINA ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            await buttonHandler(interaction);
            return;
        }

    } catch (error) {
        console.error("🚨 ERRORE DURANTE L'ELABORAZIONE DELL'INTERAZIONE:", error);
        
        const errorMessage = "❌ Si è verificato un errore imprevisto durante l'esecuzione dell'azione.";
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});

// --- EVENTI AUTOMATICI: BENVENUTO E ADDIO ---
client.on("guildMemberAdd", async (member) => {
    try {
        await entry.handleMemberAdd(member);
    } catch (error) {
        console.error("❌ Errore durante l'invio del messaggio di Benvenuto:", error);
    }
});

client.on("guildMemberRemove", async (member) => {
    try {
        await entry.handleMemberRemove(member);
    } catch (error) {
        console.error("❌ Errore durante l'invio del messaggio di Addio:", error);
    }
});

// Login del Bot
client.login(process.env.TOKEN);
