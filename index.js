require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits,
    REST,
    Routes,
    Events
} = require("discord.js");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});


client.commands = new Collection();


// ======================
// CARICAMENTO COMANDI
// ======================

const commands = [];

const commandsFolder = path.join(__dirname, "commands");

const files = fs.readdirSync(commandsFolder)
    .filter(file => file.endsWith(".js"));


for (const file of files) {

    const command = require(
        path.join(commandsFolder, file)
    );


    if (!command.data || !command.execute)
        continue;


    client.commands.set(
        command.data.name,
        command
    );


    commands.push(
        command.data.toJSON()
    );


    console.log(
        `✅ Caricato comando: ${command.data.name}`
    );

}


// ======================
// AVVIO BOT + DEPLOY
// ======================

client.once(Events.ClientReady, async () => {

    console.log(
        `🤖 Online: ${client.user.tag}`
    );


    console.log(
        "📋 Comandi:",
        commands.map(c => c.name)
    );


    try {

        const rest = new REST({
            version: "10"
        }).setToken(process.env.TOKEN);


        console.log(
            "🚀 Invio comandi Discord..."
        );


        await rest.put(

            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),

            {
                body: commands
            }

        );


        console.log(
            "✅ Deploy completato!"
        );


    } catch (error) {

        console.error(
            "❌ Deploy fallito:",
            error
        );

    }

});


// ======================
// INTERAZIONI
// ======================

client.on(
    Events.InteractionCreate,
    async interaction => {

        if (!interaction.isChatInputCommand())
            return;


        const command = client.commands.get(
            interaction.commandName
        );


        if (!command)
            return;


        try {

            await command.execute(interaction);

        } catch (error) {

            console.error(error);

            if (!interaction.replied) {

                await interaction.reply({
                    content: "Errore durante il comando.",
                    ephemeral: true
                });

            }

        }

    }
);


// ======================
// LOGIN
// ======================

client.login(process.env.TOKEN);
