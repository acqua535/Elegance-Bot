const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Raccolta comandi
client.commands = new Collection();

// Caricamento comandi
require("./handlers/commandHandler")(client);

// Registrazione comandi Discord
require("./handlers/deployCommands");

// Gestione errori globale
process.on("unhandledRejection", (error) => {
    console.error("❌ Errore non gestito:", error);
});

process.on("uncaughtException", (error) => {
    console.error("❌ Eccezione non gestita:", error);
});

// Quando il bot è online
client.once("ready", () => {
    console.log(`⚜️ Elegance-Bot online come ${client.user.tag}`);

    client.user.setActivity("Elegance Community", {
        type: 3
    });
});

// Login
console.log("TOKEN PRESENTE:", process.env.TOKEN ? "SI" : "NO");

client.login(process.env.TOKEN);
