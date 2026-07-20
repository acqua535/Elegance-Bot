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

// ==========================
// CONFIGURAZIONE DOMANDE (Fake IA)
// ==========================
const DOMANDE = {
    bug: ["Qual è il bug riscontrato?", "Da quanto tempo persiste?", "Quali sono i passaggi per riprodurlo?"],
    partner: ["Che server rappresenti?", "Qual è la tua proposta?", "Quanti membri ha il tuo server?"],
    staff: ["Età?", "Esperienza precedente?", "Perché dovremmo prenderti?"],
    report: ["Chi è l'utente da segnalare?", "Quale regola ha infranto?", "Hai delle prove (screenshot/link)?"]
};

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
        
        const verify = require("./verify");
        client.commands.set(verify.data.name, verify);
        
        console.log("📦 Comandi caricati in memoria locale:", client.commands.size);
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

    // Se siamo ancora nei limiti delle 3 domande
    if (ticketData.step < 3) {
        ticketData.step++;
        ticketSystem.updateTicket(ticketData.owner, ticketData);

        if (ticketData.step <= 3) {
            const index = ticketData.step - 1;
            const domanda = DOMANDE[ticketData.type] ? DOMANDE[ticketData.type][index] : null;
            
            if (domanda) {
                await message.channel.send(`🤖 **Assistente Elegance [Step ${ticketData.step}/3]:**\n${domanda}`);
            } else if (ticketData.step === 3) {
                await message.channel.send("✅ Abbiamo ricevuto tutte le informazioni necessarie. Uno staffer arriverà a breve.");
            }
        }
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
            if (interaction.customId === "verify_modal") {
                const verify = require("./verify");
                await verify.modalHandler(interaction);
            }
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

client.once("ready", (c) => {
    console.log(`⚜️ Elegance-Bot online come ${c.user.tag}`);
    c.user.setActivity("Elegance Community", { type: 3 });
});

client.login(process.env.TOKEN);
