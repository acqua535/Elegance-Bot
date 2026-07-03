const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// =====================
// 📦 COMANDI
// =====================
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Ping bot"),
  new SlashCommandBuilder().setName("meme").setDescription("Meme casuale"),
  new SlashCommandBuilder().setName("coinflip").setDescription("Testa o croce")
].map(c => c.toJSON());

// =====================
// ⚡ INTERACTION HANDLER (FIX 100% RESPONDING)
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {

    if (interaction.commandName === "ping") {
      return interaction.reply(`🏓 Pong! ${Date.now() - interaction.createdTimestamp}ms`);
    }

    if (interaction.commandName === "meme") {
      const res = await fetch("https://meme-api.com/gimme");
      const data = await res.json();
      return interaction.reply(`${data.title}\n${data.url}`);
    }

    if (interaction.commandName === "coinflip") {
      const r = Math.random() < 0.5 ? "TESTA" : "CROCE";
      return interaction.reply(`🎮 ${r}`);
    }

  } catch (err) {
    console.error(err);

    if (!interaction.replied) {
      await interaction.reply("❌ Errore comando");
    }
  }
});

// =====================
// 🚀 REGISTRAZIONE GLOBALE (NO GUILD ID, NO ERRORI)
// =====================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
  console.log(`✅ Online come ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log("📌 Comandi GLOBAL registrati");
  } catch (err) {
    console.error(err);
  }
});

// =====================
// 🔑 LOGIN
// =====================
client.login(process.env.TOKEN);
