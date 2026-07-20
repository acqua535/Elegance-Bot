const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
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
const buttonHandler = require("./buttonHandler"); // Il nostro gestore universale
const ticketSystem = require("./ticketSystem");

// CONFIGURAZIONE DOMANDE (Fake IA)
const DOMANDE = {
    bug: ["Qual è il bug riscontrato?", "Da quanto tempo persiste?", "Quali sono i passaggi per riprodurlo?"],
    partner: ["Che server rappresenti?", "Qual è la tua proposta?", "Quanti membri ha il tuo server?"],
    staff: ["Età?", "Esperienza precedente?", "Perché dovremmo prenderti?"],
    report: ["Chi è l'utente da segnalare?", "Quale regola ha infranto?", "Hai delle prove?"]
};

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
// LOGICA ASSISTENZA (Fake IA)
// ==========================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const ticketData = ticketSystem.getTicketByChannel(message.channel.id);
    if (!ticketData) return;

    if (ticketData.step < 3) {
        ticketData.step++;
        ticketSystem.updateTicket(ticketData.owner, ticketData);

        const domanda = DOMANDE[ticketData.type] ? DOMANDE[ticketData.type][ticketData.step - 1] : null;
        
        if (domanda) {
            await message.channel.send(`🤖 **Assistente Elegance [Step ${ticketData.step}/3]:**\n${domanda}`);
        } else {
            await message.channel.send("✅ Abbiamo ricevuto tutto. Uno staffer arriverà a breve.");
        }
    }
});

// ==========================
// INTERACTION ROUTER UNIVERSALE
// ==========================
client.on("interactionCreate", async interaction => {
    try {
        // 1. Gestione Comandi Slash
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        }
        // 2. Gestione Universale Bottoni e Menu (Ticket, Verify, ecc.)
        else if (interaction.isButton() || interaction.isStringSelectMenu()) {
            await buttonHandler(interaction);
        }
        // 3. Gestione Modali (Verify o Aggiungi Utenti)
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === "verify_modal") {
                await require("./verify").modalHandler(interaction);
            }
        }
    } catch (error) {
        console.error("❌ Errore interazione:", error);
    }
});

client.once("ready", (c) => {
    console.log(`⚜️ Elegance-Bot online come ${c.user.tag}`);
    c.user.setActivity("Elegance Community", { type: 3 });
});

client.login(process.env.TOKEN);
