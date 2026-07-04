const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// ================= LOAD COMMANDS =================
const commandsPath = path.join(__dirname, "commands");

fs.readdirSync(commandsPath).forEach(file => {
  if (!file.endsWith(".js")) return;

  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
});

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

      return await command.execute(interaction);
    }

    // BUTTONS
    if (interaction.isButton()) {
      const ticket = client.commands.get("ticket");
      if (!ticket) return;

      if (interaction.customId === "create_ticket") {
        return await ticket.buttonHandler(interaction);
      }

      if (interaction.customId === "close_ticket") {
        return await ticket.closeHandler(interaction);
      }
    }

  } catch (err) {
    console.error("❌ Interaction Error:", err);

    try {
      if (interaction.replied || interaction.deferred) return;

      await interaction.reply({
        content: "❌ Errore interazione",
        ephemeral: true
      });
    } catch (e) {
      console.error("❌ Reply error:", e);
    }
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
