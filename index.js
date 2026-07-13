const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();


// Command Handler
require("./commandHandler")(client);


// Sistemi
const ticket = require("./ticket");
const verify = require("./verify");


// Error Handling
process.on("unhandledRejection", error => {
    console.error("❌ Errore non gestito:", error);
});

process.on("uncaughtException", error => {
    console.error("❌ Eccezione non gestita:", error);
});


// Ready
client.once("ready", () => {

    console.log(`⚜️ Elegance-Bot online come ${client.user.tag}`);

    client.user.setActivity("Elegance Community", {
        type: 3
    });

});


// Interazioni
client.on("interactionCreate", async interaction => {

    try {

        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            await command.execute(interaction);
            return;

        }

        if (interaction.isStringSelectMenu()) {

            await ticket.categoryHandler(interaction);
            return;

        }

        if (interaction.isButton()) {

            if (interaction.customId === "verify_button") {

                await verify.buttonHandler(interaction);
                return;

            }

            await ticket.buttonHandler(interaction);
            return;

        }

        if (interaction.isModalSubmit()) {

            if (interaction.customId === "verify_modal") {

                await verify.modalHandler(interaction);
                return;

            }

        }

    } catch (error) {

        console.error("❌ Errore interaction:", error);

        if (!interaction.replied && !interaction.deferred) {

            await interaction.reply({
                content: "❌ Errore durante l'esecuzione.",
                ephemeral: true
            }).catch(() => {});

        }

    }

});

console.log(
    "TOKEN PRESENTE:",
    process.env.TOKEN ? "SI" : "NO"
);

client.login(process.env.TOKEN);
