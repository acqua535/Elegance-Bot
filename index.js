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
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command?.data?.name) {
    client.commands.set(command.data.name, command);
  }
}

console.log(`📌 Comandi caricati: ${client.commands.size}`);

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// ================= SLASH COMMANDS =================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);

  } catch (err) {
    console.error("❌ Slash error:", err);

    if (!interaction.replied && !interaction.deferred) {
      interaction.reply({
        content: "❌ Errore durante il comando",
        ephemeral: true
      });
    }
  }
});

// ================= BUTTONS =================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isButton()) return;

    const ticket = client.commands.get("ticket");
    if (!ticket) return;

    // 🎫 ticket create buttons
    if (
      interaction.customId === "ticket_support" ||
      interaction.customId === "ticket_partner" ||
      interaction.customId === "ticket_collab" ||
      interaction.customId === "ticket_staff"
    ) {
      return await ticket.buttonHandler(interaction);
    }

    // 🔒 close ticket
    if (interaction.customId === "ticket_close") {
      return await ticket.closeHandler(interaction);
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
