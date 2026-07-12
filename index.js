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
require("./commandHandler")(client);

// Registrazione comandi Discord
require("./deployCommands");

// Gestione interazioni comandi
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error("❌ Errore comando:", error);

        if (!interaction.replied) {
            await interaction.reply({
                content: "❌ Si è verificato un errore durante l'esecuzione del comando.",
                ephemeral: true
            });
        }
    }
});

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
