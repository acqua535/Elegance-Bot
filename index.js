require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits,
    Events,
    REST,
    Routes
} = require("discord.js");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});


client.commands = new Collection();

const commands = [];


// ======================
// LOAD COMMANDS
// ======================

const commandsPath = path.join(__dirname, "commands");


if (fs.existsSync(commandsPath)) {

    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));


    for (const file of commandFiles) {

        const command = require(
            path.join(commandsPath, file)
        );


        if (command.data && command.execute) {

            client.commands.set(
                command.data.name,
                command
            );


            commands.push(
                command.data.toJSON()
            );


            console.log(
                `✅ Caricato: ${command.data.name}`
            );

        } else {

            console.log(
                `⚠️ Comando ignorato: ${file}`
            );

        }

    }

}


// ======================
// READY + AUTO DEPLOY
// ======================

client.once(Events.ClientReady, async () => {

    console.log(
        `🤖 Online come ${client.user.tag}`
    );


    try {

        console.log(
            "📋 Comandi trovati:",
            commands.map(command => command.name)
        );


        if (!process.env.CLIENT_ID || !process.env.GUILD_ID) {

            console.error(
                "❌ CLIENT_ID o GUILD_ID mancanti nel .env"
            );

            return;

        }


        const rest = new REST({
            version: "10"
        }).setToken(process.env.TOKEN);


        console.log(
            "🚀 Deploy automatico comandi..."
        );


        const deployedCommands = await rest.put(

            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),

            {
                body: commands
            }

        );


        console.log(
            `✅ Comandi deployati: ${deployedCommands.length}`
        );


    } catch (error) {

        console.error(
            "❌ Errore deploy:",
            error
        );

    }

});


// ======================
// COMMAND HANDLER
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
                    content: "❌ Errore comando.",
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
