const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'deployCommand.js');

for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));

    if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`✅ Comando caricato: ${command.data.name}`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🔄 Registrazione comandi...');

        await rest.put(
            Routes.applicationCommands('1526563655498600568'),
            { body: commands }
        );

        console.log(`✅ ${commands.length} comandi registrati correttamente!`);

    } catch (error) {
        console.error(error);
    }
})();
