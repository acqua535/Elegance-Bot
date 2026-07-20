const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Import moduli
const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand");
const buttonHandler = require("./buttonHandler"); 

// ==========================
// INIZIALIZZAZIONE
// ==========================
(async () => {
    try {
        await deployCommands();
        loadCommands(client);
        console.log("📦 Bot inizializzato correttamente.");
    } catch (error) {
        console.error("❌ Errore durante l'inizializzazione:", error);
    }
})();

// ==========================
// CICLO DI PULIZIA AUTOMATICA (Check inattività ogni minuto)
// ==========================
setInterval(() => {
    if (!fs.existsSync('./ticketsData.json')) return;
    const data = JSON.parse(fs.readFileSync('./ticketsData.json', 'utf8') || '{}');
    const now = Date.now();

    for (const channelId in data) {
        const ticket = data[channelId];
        if (ticket.status !== 'open') continue;

        const inactiveTime = now - (ticket.lastMessage || Date.now());

        // Se inattivo da 23 ore (avviso)
        if (inactiveTime > 82800000 && !ticket.warned) {
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                channel.send("⚠️ **AVVISO:** Il ticket verrà chiuso automaticamente tra 1 ora per inattività.");
                ticket.warned = true;
                fs.writeFileSync('./ticketsData.json', JSON.stringify(data, null, 4));
            }
        }

        // Se inattivo da 24 ore (chiusura)
        if (inactiveTime > 86400000) {
            const channel = client.channels.cache.get(channelId);
            if (channel) channel.delete().catch(() => {});
            delete data[channelId];
            fs.writeFileSync('./ticketsData.json', JSON.stringify(data, null, 4));
        }
    }
}, 60000); 

// ==========================
// INTERACTION ROUTER
// ==========================
client.on("interactionCreate", async interaction => {
    try {
        // Gestione Menu Categorie Ticket
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
            await client.commands.get('ticket').categoryHandler(interaction);
        }
        // Gestione Bottoni (Ping & Close)
        else if (interaction.isButton() && ['ping_staff', 'close_ticket'].includes(interaction.customId)) {
            await client.commands.get('ticket').buttonHandler(interaction);
        }
        // Gestione Comandi Slash
        else if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }
        // Gestione Modali
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === "verify_modal") await require("./verify").modalHandler(interaction);
        }
    } catch (error) {
        console.error("❌ Errore interazione:", error);
    }
});

// ==========================
// MESSAGE ROUTER (Aggiorna lastMessage)
// ==========================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    // Aggiorna l'attività del ticket
    const ticketCmd = client.commands.get('ticket');
    if (ticketCmd) await ticketCmd.handleMessage(message);
});

client.once("ready", (c) => {
    console.log(`⚜️ Elegance-Bot online come ${c.user.tag}`);
    c.user.setActivity("Elegance Community", { type: 3 });
});

client.login(process.env.TOKEN);
