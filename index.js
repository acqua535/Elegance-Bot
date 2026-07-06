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

// =========================
// LOAD COMMANDS
// =========================

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {

    const command = require(`./commands/${file}`);

    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded: ${command.data.name}`);
    }

}

// =========================
// READY
// =========================

client.once(Events.ClientReady, () => {
    console.log(`🤖 Online as ${client.user.tag}`);
});

// =========================
// INTERACTIONS
// =========================

client.on(Events.InteractionCreate, async interaction => {

    // SLASH COMMANDS
    if (interaction.isChatInputCommand()) {

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: "❌ Errore comando.",
                ephemeral: true
            });
        }
    }

    // =========================
    // MINIGAME MENU SYSTEM
    // =========================

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === "minigame_select") {

            const value = interaction.values[0];

            const games = {
                dice: { name: "🎲 Dice", desc: "Lancia un dado da 1 a 6" },
                coinflip: { name: "🪙 Coinflip", desc: "Testa o Croce" },
                rps: { name: "✂️ Sasso Carta Forbici", desc: "Sfida il bot" },
                guess: { name: "🔢 Numero Segreto", desc: "Indovina il numero" },
                reaction: { name: "⚡ Reaction Test", desc: "Rispondi velocissimo!" },
                slot: { name: "🎰 Slot Machine", desc: "Prova la fortuna" },
                bomb: { name: "💣 Bomb Game", desc: "Rischio 1 su 4" }
            };

            const game = games[value];

            // 📘 TUTORIAL (3s)
            await interaction.reply({
                content: `📘 **${game.name}**\n${game.desc}\n\n⏳ Preparazione...`,
                ephemeral: false
            });

            await new Promise(r => setTimeout(r, 3000));

            // ⏳ COUNTDOWN 10s
            let countdown = 10;

            const msg = await interaction.followUp(`⏳ Inizio tra: **${countdown}**`);

            const interval = setInterval(async () => {

                countdown--;

                if (countdown <= 0) {
                    clearInterval(interval);
                    return msg.edit("🚀 ECCO IL MINIGAME!");
                }

                if (countdown <= 3) {
                    msg.edit(`🔥 ECCO IL MINIGAME! (${countdown})`);
                } else if (countdown <= 6) {
                    msg.edit(`⚡ Ci siamo quasi... (${countdown})`);
                } else {
                    msg.edit(`⏳ Il minigame sta per iniziare... (${countdown})`);
                }

            }, 1000);

            setTimeout(async () => {

                // 🎲 DICE
                if (value === "dice") {
                    const roll = Math.floor(Math.random() * 6) + 1;
                    return interaction.followUp(`🎲 Risultato: **${roll}**`);
                }

                // 🪙 COINFLIP
                if (value === "coinflip") {
                    const res = Math.random() < 0.5 ? "Testa" : "Croce";
                    return interaction.followUp(`🪙 Risultato: **${res}**`);
                }

                // ✂️ RPS
                if (value === "rps") {
                    const choices = ["Sasso", "Carta", "Forbici"];
                    const bot = choices[Math.floor(Math.random() * choices.length)];
                    return interaction.followUp(`🤖 Io scelgo: **${bot}**`);
                }

                // 🔢 GUESS
                if (value === "guess") {
                    const num = Math.floor(Math.random() * 10) + 1;
                    return interaction.followUp(`🔢 Numero: **${num}**`);
                }

                // ⚡ REACTION
                if (value === "reaction") {

                    const start = Date.now();

                    await interaction.followUp("⚡ Preparati...");

                    setTimeout(async () => {
                        const time = Date.now() - start;
                        await interaction.followUp(`🔥 Tempo: **${time}ms**`);
                    }, Math.random() * 4000 + 2000);
                }

                // 🎰 SLOT
                if (value === "slot") {

                    const items = ["🍒", "🍋", "⭐", "💎", "7️⃣"];

                    const r1 = items[Math.floor(Math.random() * items.length)];
                    const r2 = items[Math.floor(Math.random() * items.length)];
                    const r3 = items[Math.floor(Math.random() * items.length)];

                    let result = "Hai perso 😭";

                    if (r1 === r2 && r2 === r3) result = "JACKPOT 🔥";
                    else if (r1 === r2 || r2 === r3 || r1 === r3) result = "Quasi 😎";

                    return interaction.followUp(`🎰 | ${r1} | ${r2} | ${r3} |\n${result}`);
                }

                // 💣 BOMB
                if (value === "bomb") {

                    const explode = Math.floor(Math.random() * 4);

                    if (explode === 0) {
                        return interaction.followUp("💣 BOOM! Hai perso 😭");
                    }

                    return interaction.followUp("😎 Sei salvo!");
                }

            }, 10000);
        }
    }
});

client.login(process.env.TOKEN);
