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


// Sistema Ticket + Slash Commands
const ticket = require("./ticket");

client.on("interactionCreate", async (interaction) => {

    try {

        // Comandi Slash (/say, /embed, /ticket)
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            await command.execute(interaction);

        }


        // Menu Ticket
        if (interaction.isStringSelectMenu()) {

            await ticket.categoryHandler(interaction);

        }


    } catch (error) {

        console.error("❌ Errore interaction:", error);

        if (!interaction.replied && !interaction.deferred) {

            await interaction.reply({
                content: "❌ Errore durante l'esecuzione.",
                ephemeral: true
            });

        }

    }

});


console.log("TOKEN PRESENTE:", process.env.TOKEN ? "SI" : "NO");

client.login(process.env.TOKEN);
