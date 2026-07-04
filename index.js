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

  if (!command?.data?.name) {
    console.warn(`⚠️ Comando non valido: ${file}`);
    return;
  }

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

    // ================= SLASH COMMANDS =================
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({
          content: "❌ Comando non trovato",
          ephemeral: true
        });
      }

      return await command.execute(interaction);
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {
      const ticket = client.commands.get("ticket");
      if (!ticket) return;

      const id = interaction.customId;

      try {
        if (id === "ticket_open") {
          return await ticket.open(interaction);
        }

        if (id === "ticket_take") {
          return await ticket.take(interaction);
        }

        if (id === "ticket_close") {
          return await ticket.close(interaction);
        }

      } catch (err) {
        console.error("❌ Button error:", err);

        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Errore bottone",
            ephemeral: true
          });
        }
      }
    }

  } catch (err) {
    console.error("❌ Interaction Error:", err);

    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Errore interno bot",
          ephemeral: true
        });
      }
    } catch (e) {
      console.error("❌ Critical reply error:", e);
    }
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
