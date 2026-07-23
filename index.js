const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require("discord.js");
require("dotenv").config();

const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand");
const buttonHandler = require("./buttonHandler");
const entry = require("./entry");
const invites = require("./invites");
const logSystem = require("./logSystem"); 
const countingSystem = require("./countingSystem"); 

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

client.once("ready", async () => {
    console.log(`⚜️  Bot connesso con successo come: ${client.user.tag}`);

    client.guilds.cache.forEach(guild => {
        invites.initInvites(guild);
    });

    await deployCommands();
    loadCommands(client);

    logSystem(client);
    countingSystem(client);

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

        // GESTIONE MODULI POP-UP (MODALS)
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

            // 🎫 Gestione Moduli Pop-up dei Ticket
            if (interaction.customId.startsWith("ticket_modal_")) {
                const ticketCmd = client.commands.get("ticket");
                if (ticketCmd && ticketCmd.modalHandler) {
                    return await ticketCmd.modalHandler(interaction);
                }
            }
        }

        // Gestisce pulsanti e menu a tendina
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
