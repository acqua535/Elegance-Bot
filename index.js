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

// Import moduli essenziali
const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand");

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
// ROUTER INTERAZIONI (Il cuore del sistema)
// ==========================
client.on("interactionCreate", async interaction => {
    try {
        const ticketCmd = client.commands.get('ticket');

        // 1. Gestione Menu Ticket (Select Menu)
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
            await ticketCmd.categoryHandler(interaction);
        }
        // 2. Gestione Bottoni Ticket (Ping & Close)
        else if (interaction.isButton() && ['ping_staff', 'close_ticket'].includes(interaction.customId)) {
            await ticketCmd.buttonHandler(interaction);
        }
        // 3. Gestione Comandi Slash (/)
        else if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }
    } catch (error) {
        console.error("❌ Errore critico interazione:", error);
    }
});

// ==========================
// MESSAGE ROUTER (Per l'inattività)
// ==========================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const ticketCmd = client.commands.get('ticket');
    if (ticketCmd) await ticketCmd.handleMessage(message);
});

// ==========================
// CICLO DI PULIZIA (Autodistruzione)
// ==========================
setInterval(() => {
    if (!fs.existsSync('./ticketsData.json')) return;
    const data = JSON.parse(fs.readFileSync('./ticketsData.json', 'utf8') || '{}');
    const now = Date.now();

    for (const channelId in data) {
        const ticket = data[channelId];
        if (ticket.status !== 'open') continue;

        // Se inattivo da oltre 24 ore -> Elimina
        if ((now - (ticket.lastMessage || Date.now())) > 86400000) {
            const channel = client.channels.cache.get(channelId);
            if (channel) channel.delete().catch(() => {});
            delete data[channelId];
            fs.writeFileSync('./ticketsData.json', JSON.stringify(data, null, 4));
        }
    }
}, 60000); // Controllo ogni minuto

client.once("ready", (c) => {
    console.log(`⚜️ Elegance-Bot online come ${c.user.tag}`);
    c.user.setActivity("Elegance Community", { type: 3 });
});

client.login(process.env.TOKEN);
