const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📦 COLLEZIONE COMANDI
client.commands = new Collection();

// 📂 CARICAMENTO AUTOMATICO COMANDI
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// ⚡ INTERACTIONS FIX
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);

  } catch (err) {
    console.error("❌ Interaction error:", err);

    if (interaction.replied || interaction.deferred) return;

    await interaction.reply({
      content: "❌ Errore interno comando",
      ephemeral: true
    }).catch(() => {}); 
  }
});

client.login(process.env.TOKEN);
