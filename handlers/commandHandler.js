const fs = require("fs");
const path = require("path");

module.exports = (client) => {
    const commandsPath = path.join(__dirname, "../commands");

    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath);
    }

    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`${commandsPath}/${file}`);

        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Comando caricato: ${command.data.name}`);
        }
    }
};
