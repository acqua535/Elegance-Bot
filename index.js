const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🏓 PING
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    const ping = Date.now() - interaction.createdTimestamp;
    return interaction.reply(`🏓 Pong! ${ping}ms`);
  }

  // 😂 MEME
  if (interaction.commandName === "meme") {
    try {
      const res = await fetch("https://meme-api.com/gimme");
      const data = await res.json();

      return interaction.reply(`${data.title}\n${data.url}`);
    } catch {
      return interaction.reply("❌ Meme non disponibile");
    }
  }
});

client.once("ready", () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

client.login(process.env.TOKEN);
