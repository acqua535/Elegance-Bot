const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// ================= LOAD COMMANDS =================
const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  }
}

console.log(`📌 Comandi caricati: ${client.commands.size}`);

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// ================= INTERACTIONS =================
client.on(Events.InteractionCreate, async interaction => {

  try {

    // SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction);
    }

    // BUTTONS
    if (interaction.isButton()) {
      const ticket = client.commands.get("ticket");
      if (!ticket) return;

      if (interaction.customId === "ticket_create") {
        return ticket.buttonHandler(interaction);
      }

      if (interaction.customId === "ticket_close") {
        return ticket.closeHandler(interaction);
      }
    }

  } catch (err) {
    console.error("❌ Error:", err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Errore interazione",
        ephemeral: true
      });
    }
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
