const { Client, GatewayIntentBits, Collection, MessageFlags } = require("discord.js");
require("dotenv").config();

const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand");
const buttonHandler = require("./buttonHandler");
const entry = require("./entry");
const invites = require("./invites");
const logSystem = require("./logSystem"); // Importato il modulo dei log

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates // Aggiunto per tracciare i log dei canali vocali
    ]
});

client.commands = new Collection();

client.once("ready", async () => {
    console.log(`⚜️  Bot connesso con successo come: ${client.user.tag}`);

    // Inizializzazione della mappa degli inviti
    client.guilds.cache.forEach(guild => {
        invites.initInvites(guild);
    });

    await deployCommands();
    loadCommands(client);

    // Inizializzazione dei log di sistema
    logSystem(client);

    console.log("📦 Inizializzazione completata e Bot totalmente operativo!");
});

client.on("interactionCreate", async (interaction) => {
    try {
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

        if (interaction.isModalSubmit()) {
            // Modal Verifica / Captcha
            if (interaction.customId.startsWith("verify_modal_")) {
                const verifyCmd = client.commands.get("verify");
                if (verifyCmd && verifyCmd.modalHandler) {
                    return await verifyCmd.modalHandler(interaction);
                }
            }

            // Modal Form Candidature
            if (interaction.customId === "apply_form_modal") {
                const applyCmd = client.commands.get("apply");
                if (applyCmd && applyCmd.modalHandler) {
                    return await applyCmd.modalHandler(interaction);
                }
            }
        }

        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            await buttonHandler(interaction);
            return;
        }

    } catch (error) {
        console.error("🚨 ERRORE INTERAZIONE:", error);
        const errorMessage = "❌ Si è verificato un errore imprevisto.";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});

client.on("guildMemberAdd", async (member) => {
    try {
        await entry.handleMemberAdd(member);
        await invites.handleMemberAdd(member);
    } catch (error) {
        console.error("❌ Errore durante l'evento guildMemberAdd:", error);
    }
});

client.on("guildMemberRemove", async (member) => {
    try {
        await entry.handleMemberRemove(member);
        await invites.handleMemberRemove(member);
    } catch (error) {
        console.error("❌ Errore durante l'evento guildMemberRemove:", error);
    }
});

client.login(process.env.TOKEN);
