const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

// Caricamento comandi (usa il tuo commandHandler)
require("./commandHandler")(client);

client.on("interactionCreate", async interaction => {
    try {
        const ticketCmd = client.commands.get('ticket');
        
        // Gestione Menu
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
            await ticketCmd.categoryHandler(interaction);
        } 
        // Gestione Bottoni
        else if (interaction.isButton() && ['ping_staff', 'close_ticket'].includes(interaction.customId)) {
            await ticketCmd.buttonHandler(interaction);
        }
        // Gestione Slash
        else if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }
    } catch (e) { console.error("ERRORE:", e); }
});

client.on('messageCreate', async (m) => {
    if (m.author.bot) return;
    const ticketCmd = client.commands.get('ticket');
    if (ticketCmd) await ticketCmd.handleMessage(m);
});

client.login(process.env.TOKEN);
