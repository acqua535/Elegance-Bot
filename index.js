const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

// Usa process.cwd() che garantisce la cartella di esecuzione principale su Linux/Discloud
const commandsPath = path.join(process.cwd(), "commands");
if (!fs.existsSync(commandsPath)) {
    console.log("📂 [FIX] Cartella 'commands' non trovata. Creazione in corso...");
    fs.mkdirSync(commandsPath);
}

// ==========================
// CLIENT
// ==========================
const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// ==========================
// HANDLERS
// ==========================
const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand"); 
const ticket = require("./ticket");
const buttonHandler = require("./buttonHandler");
const ticketSystem = require("./ticketSystem"); // NECESSARIO PER L'IA

// ==========================
// AVVIO GENERALE DEI COMANDI
// ==========================
(async () => {
    try {
        await deployCommands(); 
        loadCommands(client);   
        
        console.log("📦 Comandi caricati in memoria locale:", client.commands.size);
    } catch (error) {
        console.error("❌ Errore durante l'inizializzazione dei comandi:", error);
    }
})();

// ==========================
// ERROR SYSTEM
// ==========================
process.on("unhandledRejection", error => console.error("❌ Unhandled Promise:", error));
process.on("uncaughtException", error => console.error("❌ Uncaught Exception:", error));

// ==========================
// READY SYSTEM
// ==========================
client.once("ready", async (readyClient) => {
    console.log(`⚜️ Elegance-Bot online come ${readyClient.user.tag}`);
    readyClient.user.setActivity("Elegance Community", { type: 3 });
});

// ==========================
// ASSISTENZA IA (LOGICA DOMANDE)
// ==========================
const DOMANDE = {
    bug: ["Qual è il bug riscontrato?", "Da quanto tempo persiste?", "Quali sono i passaggi per riprodurlo?"],
    partner: ["Che server rappresenti?", "Qual è la tua proposta?", "Quanti membri ha il tuo server?"],
    staff: ["Età?", "Esperienza precedente?", "Perché dovremmo prenderti?"],
    idea: ["Qual è la tua idea?", "Come aiuterebbe il server?", "C'è altro da aggiungere?"]
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // Controlla se il messaggio è in un canale ticket
    const ticketData = ticketSystem.getTicketByChannel(message.channel.id);
    if (!ticketData || ticketData.step === 0 || ticketData.step >= 3) return;

    // Incrementa lo step
    ticketData.step++;
    ticketSystem.updateTicket(ticketData.userId, ticketData);

    if (ticketData.step < 3) {
        await message.channel.send(`✅ Ricevuto. **DOMANDA ${ticketData.step + 1}/3:** ${DOMANDE[ticketData.type][ticketData.step]}`);
    } else {
        await message.channel.send("✅ Abbiamo ricevuto tutte le info. Uno staffer arriverà a breve.");
    }
});

// ==========================
// INTERACTION ROUTER
// ==========================
client.on("interactionCreate", async interaction => {
    try {
        if(interaction.isChatInputCommand()){
            const command = client.commands.get(interaction.commandName);
            if(!command) return;
            await command.execute(interaction);
            return;
        }

        if(interaction.isButton()){
            await buttonHandler(interaction);
            return;
        }

        if(interaction.isStringSelectMenu()){
            if(interaction.customId === "ticket_category"){
                await ticket.categoryHandler(interaction);
                return;
            }
            if(interaction.customId === "ticket_manage"){
                await ticket.router(interaction);
                return;
            }
        }

        if(interaction.isModalSubmit()){
            if(interaction.customId === "verify_modal"){
                const verifyDynamic = require("./commands/verify.js");
                await verifyDynamic.modalHandler(interaction);
                return;
            }
        }
    } catch(error){
        console.error("❌ Errore interaction:", error);
    }
});

client.login(process.env.TOKEN);
