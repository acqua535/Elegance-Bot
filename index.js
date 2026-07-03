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
// 📦 SOLO COMANDI PULITI
// =====================
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Ping bot"),
  new SlashCommandBuilder().setName("meme").setDescription("Meme casuale"),
  new SlashCommandBuilder().setName("coinflip").setDescription("Testa o croce")
].map(c => c.toJSON());

// =====================
// ⚡ LOGICA
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    const ping = Date.now() - interaction.createdTimestamp;
    return interaction.reply(`🏓 Pong! ${ping}ms`);
  }

  if (interaction.commandName === "meme") {
    try {
      const res = await fetch("https://meme-api.com/gimme");
      const data = await res.json();
      return interaction.reply(`${data.title}\n${data.url}`);
    } catch {
      return interaction.reply("❌ Meme non disponibile");
    }
  }

  if (interaction.commandName === "coinflip") {
    const result = Math.random() < 0.5 ? "TESTA" : "CROCE";
    return interaction.reply(`🎮 ${result}`);
  }
});

// =====================
// 🚀 REGISTRAZIONE COMANDI (CHIAVE FIX)
// =====================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
  console.log(`✅ Online come ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("📌 Comandi sincronizzati da zero");
  } catch (err) {
    console.error(err);
  }
});

// =====================
// 🔑 LOGIN
// =====================
client.login(process.env.TOKEN);
