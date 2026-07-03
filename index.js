const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";

client.once("ready", () => {
  console.log(`Bot online come ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    message.reply("🏓 Pong!");
  }

  if (command === "help") {
    message.reply("Comandi: !ping !help !say");
  }

  if (command === "say") {
    const text = args.join(" ");
    if (!text) return message.reply("Scrivi qualcosa dopo !say");
    message.channel.send(text);
  }
});

client.login(process.env.TOKEN);
