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


// Deploy Command
require("./deployCommand");


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

        console.log(
            "📩 Interazione ricevuta:",
            interaction.commandName
        );


        if (interaction.isChatInputCommand()) {

            const command =
                client.commands.get(
                    interaction.commandName
                );


            if (!command) {

                console.log(
                    "❌ Comando non trovato:",
                    interaction.commandName
                );

                return;

            }


            try {

                await command.execute(interaction);

            } catch(error) {

                console.error(
                    "❌ Errore comando:",
                    interaction.commandName,
                    error
                );


                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    await interaction.reply({

                        content:
                        "❌ Errore durante il comando.",

                        ephemeral:true

                    }).catch(()=>{});

                }

            }


            return;

        }


        if (interaction.isStringSelectMenu()) {

            await ticket.categoryHandler(interaction);
            return;

        }


        if (interaction.isButton()) {


            if (
                interaction.customId === "verify_button"
            ) {

                await verify.buttonHandler(interaction);
                return;

            }


            await ticket.buttonHandler(interaction);
            return;

        }


        if (interaction.isModalSubmit()) {


            if (
                interaction.customId === "verify_modal"
            ) {

                await verify.modalHandler(interaction);
                return;

            }

        }


    } catch (error) {

        console.error(
            "❌ Errore interaction:",
            error
        );


        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({

                content:
                "❌ Errore durante l'esecuzione.",

                ephemeral:true

            }).catch(()=>{});

        }

    }

});


console.log(
    "TOKEN PRESENTE:",
    process.env.TOKEN ? "SI" : "NO"
);


client.login(
    process.env.TOKEN
);
