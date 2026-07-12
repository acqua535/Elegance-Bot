const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

require("./commandHandler")(client);
require("./deployCommands");

process.on("unhandledRejection", (error) => {
    console.error("❌ Errore non gestito:", error);
});

process.on("uncaughtException", (error) => {
    console.error("❌ Eccezione non gestita:", error);
});


client.once("ready", () => {
    console.log(`⚜️ Elegance-Bot online come ${client.user.tag}`);

    client.user.setActivity("Elegance Community", {
        type: 3
    });
});


// Sistema Ticket
const ticket = require("./ticket");

client.on("interactionCreate", async (interaction) => {

    if (interaction.isStringSelectMenu()) {
        await ticket.categoryHandler(interaction);
    }

});


console.log("TOKEN PRESENTE:", process.env.TOKEN ? "SI" : "NO");

client.login(process.env.TOKEN);
