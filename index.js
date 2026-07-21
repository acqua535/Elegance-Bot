const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
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

const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand");
const buttonHandler = require("./buttonHandler"); // Gestore basato su registry

(async () => {
    try {
        await deployCommands();
        loadCommands(client);
        console.log("📦 Bot inizializzato correttamente.");
    } catch (error) {
        console.error("❌ Errore durante l'inizializzazione:", error);
    }
})();

// Router interazioni centralizzato e pulito
client.on(Events.InteractionCreate, async interaction => {
    try {
        // Se è un bottone o un select menu, lo passiamo al buttonHandler
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            await buttonHandler(interaction);
        }
        // Se è un Modal (es: il CAPTCHA di verify.js)
        else if (interaction.isModalSubmit()) {
            const verifyCmd = client.commands.get("verify");
            if (verifyCmd && verifyCmd.modalHandler) {
                await verifyCmd.modalHandler(interaction);
            }
        }
        // Se è un comando slash (/)
        else if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }
    } catch (error) {
        console.error("❌ Errore critico interazione:", error);
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    const ticketCmd = client.commands.get('ticket');
    if (ticketCmd && ticketCmd.handleMessage) await ticketCmd.handleMessage(message);
});

setInterval(() => {
    if (!fs.existsSync('./ticketsData.json')) return;
    const data = JSON.parse(fs.readFileSync('./ticketsData.json', 'utf8') || '{}');
    const now = Date.now();

    for (const channelId in data) {
        const ticket = data[channelId];
        if (ticket.status !== 'open') continue;

        if ((now - (ticket.lastMessage || Date.now())) > 86400000) {
            const channel = client.channels.cache.get(channelId);
            if (channel) channel.delete().catch(() => {});
            delete data[channelId];
            fs.writeFileSync('./ticketsData.json', JSON.stringify(data, null, 4));
        }
    }
}, 60000);

client.once(Events.ClientReady, (c) => {
    console.log(`⚜️ Elegance-Bot online come ${c.user.tag}`);
    c.user.setActivity("Elegance Community", { type: 3 });
});

client.login(process.env.TOKEN);
