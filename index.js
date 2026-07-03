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

// ================= COMMAND LOADER =================
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const command = require(`./commands/${file}`);

    if (command?.data?.name && typeof command.execute === "function") {
      client.commands.set(command.data.name, command);
    }
  }
}

console.log(`📌 Comandi caricati: ${client.commands.size}`);

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// ================= ERROR HANDLERS (ANTI CRASH) =================
process.on("uncaughtException", err => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", err => {
  console.error("❌ Unhandled Rejection:", err);
});

// ================= INTERACTIONS =================
client.on(Events.InteractionCreate, async interaction => {

  try {

    // ================= SLASH COMMANDS =================
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error("❌ Slash error:", err);

        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Errore comando",
            ephemeral: true
          });
        }
      }
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {
      const ticket = client.commands.get("ticket");
      if (!ticket) return;

      const id = interaction.customId;

      // ticket buttons
      const ticketButtons = [
        "ticket_support",
        "ticket_partner",
        "ticket_collab",
        "ticket_staff"
      ];

      if (ticketButtons.includes(id)) {
        return await ticket.buttonHandler(interaction);
      }

      if (id === "ticket_close") {
        return await ticket.closeHandler(interaction);
      }
    }

  } catch (err) {
    console.error("❌ Interaction error:", err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Errore interazione",
        ephemeral: true
      });
    }
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
