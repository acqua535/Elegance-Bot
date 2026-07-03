const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ================= CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// ================= COMMANDS =================
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

console.log(`📌 Comandi caricati: ${client.commands.size}`);

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// ================= SLASH COMMANDS =================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      await command.execute(interaction);
    }
  } catch (err) {
    console.error("❌ Slash command error:", err);

    if (interaction.replied || interaction.deferred) return;

    interaction.reply({
      content: "❌ Errore durante l'esecuzione del comando",
      ephemeral: true
    });
  }
});

// ================= BUTTONS =================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isButton()) return;

    const ticketCommand = client.commands.get("ticket");
    if (!ticketCommand) return;

    // ticket creation buttons
    if (
      interaction.customId === "ticket_support" ||
      interaction.customId === "ticket_partner" ||
      interaction.customId === "ticket_collab" ||
      interaction.customId === "ticket_staff"
    ) {
      return await ticketCommand.buttonHandler(interaction);
    }

    // close ticket button
    if (interaction.customId === "ticket_close") {
      return await ticketCommand.closeHandler(interaction);
    }

  } catch (err) {
    console.error("❌ Button error:", err);

    if (!interaction.replied) {
      interaction.reply({
        content: "❌ Errore interazione bottone",
        ephemeral: true
      });
    }
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
