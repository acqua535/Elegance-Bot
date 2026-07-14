const commands = [];

const locations = [
    path.join(__dirname, "commands"),
    __dirname
];

const loaded = new Set();

for (const location of locations) {

    if (!fs.existsSync(location)) continue;

    const files = fs.readdirSync(location)
        .filter(file => file.endsWith(".js"))
        .filter(file => file !== "index.js")
        .filter(file => file !== "deployCommand.js")
        .filter(file => file !== "commandHandler.js");

    for (const file of files) {

        try {

            const command = require(path.join(location, file));

            if (!command.data) continue;

            if (loaded.has(command.data.name)) continue;

            loaded.add(command.data.name);

            commands.push(command.data.toJSON());

            console.log(`✅ Comando caricato: ${command.data.name}`);

        } catch (err) {

            console.error(`❌ Errore caricando ${file}:`, err);

        }

    }

}
