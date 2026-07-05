console.log("🚀 Index avviato!");

const { Client } = require("discord.js");

const client = new Client({ intents: [] });

client.once("ready", () => {
  console.log(`✅ ${client.user.tag}`);
});

client.login(process.env.TOKEN).catch(console.error);
