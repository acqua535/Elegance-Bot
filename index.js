require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits,
    Events
} = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {

    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const command = require(path.join(commandsPath, file));

        if (command.data && command.execute) {

            client.commands.set(command.data.name, command);

            console.log(`✅ Caricato: ${command.data.name}`);

        }

    }

}

client.once(Events.ClientReady, () => {

    console.log(`🤖 Online come ${client.user.tag}`);

});

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(error);

        if (!interaction.replied) {

            await interaction.reply({
                content: "❌ Errore.",
                ephemeral: true
            });

        }

    }

});

client.login(process.env.TOKEN);
