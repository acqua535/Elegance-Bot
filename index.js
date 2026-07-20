const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const commandsPath = path.join(process.cwd(), "commands");
if (!fs.existsSync(commandsPath)) {
    console.log("📂 [FIX] Cartella 'commands' non trovata. Creazione in corso...");
    fs.mkdirSync(commandsPath);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// ==========================
// HANDLERS & CARICAMENTO
// ==========================
const loadCommands = require("./commandHandler");
const deployCommands = require("./deployCommand"); 
const ticket = require("./ticket");
const buttonHandler = require("./buttonHandler");
const ticketSystem = require("./ticketSystem");

(async () => {
    try {
        await deployCommands(); 
        loadCommands(client);   
        
        // Caricamento manuale di verify dalla root
        const verify = require("./verify");
        client.commands.set(verify.data.name, verify);
        
        console.log("📦 Comandi caricati in memoria locale:", client.commands.size);
    } catch (error) {
        console.error("❌ Errore durante l'inizializzazione:", error);
    }
})();

// ==========================
// LOGICA ASSISTENZA IA
// ==========================
const DOMANDE = {
    bug: ["Qual è il bug riscontrato?", "Da quanto tempo persiste?", "Quali sono i passaggi per riprodurlo?"],
    partner: ["Che server rappresenti?", "Qual è la tua proposta?", "Quanti membri ha il tuo server?"],
    staff: ["Età?", "Esperienza precedente?", "Perché dovremmo prenderti?"],
    idea: ["Qual è la tua idea?", "Come aiuterebbe il server?", "C'è altro da aggiungere?"]
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const ticketData = ticketSystem.getTicketByChannel(message.channel.id);
    if (!ticketData || ticketData.step >= 3) return;

    ticketData.step++;
    ticketSystem.updateTicket(ticketData.owner, ticketData);

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
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        }

        else if (interaction.isButton()) {
            await buttonHandler(interaction);
        }

        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === "ticket_category") await ticket.categoryHandler(interaction);
            else if (interaction.customId === "ticket_manage") await ticket.router(interaction);
        }

        else if (interaction.isModalSubmit()) {
            // Gestione Verify
            if (interaction.customId === "verify_modal") {
                const verify = require("./verify");
                await verify.modalHandler(interaction);
            }
            // Gestione Aggiungi/Rimuovi Utenti nel Ticket
            else if (interaction.customId === "modal_add_user" || interaction.customId === "modal_remove_user") {
                const userId = interaction.fields.getTextInputValue("user_id");
                const isAdd = interaction.customId === "modal_add_user";
                await interaction.channel.permissionOverwrites.edit(userId, { ViewChannel: isAdd });
                await interaction.reply({ content: `✅ Utente <@${userId}> ${isAdd ? "aggiunto" : "rimosso"} con successo.`, ephemeral: true });
            }
        }
    } catch (error) {
        console.error("❌ Errore interaction:", error);
    }
});

client.on("clientReady", (c) => {
    console.log(`⚜️ Elegance-Bot online come ${c.user.tag}`);
    c.user.setActivity("Elegance Community", { type: 3 });
});

client.login(process.env.TOKEN);
