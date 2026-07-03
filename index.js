const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// =====================
// 🏓 PING
// =====================
client.commands.set("ping", async (interaction) => {
  await interaction.deferReply();

  const ping = Date.now() - interaction.createdTimestamp;

  await interaction.editReply(`🏓 Pong!\n⏱️ ${ping}ms`);
});

// =====================
// ✅ VERIFY
// =====================
const VERIFIED = "1522332009773404211";
const UNVERIFIED = "1505196345009635459";

client.commands.set("verify", async (interaction) => {
  await interaction.deferReply();

  const member = interaction.member;

  if (member.roles.cache.has(VERIFIED)) {
    return interaction.editReply("✅ Già verificato");
  }

  await member.roles.add(VERIFIED);
  if (member.roles.cache.has(UNVERIFIED)) {
    await member.roles.remove(UNVERIFIED);
  }

  return interaction.editReply("🎉 Verifica completata!");
});

// =====================
// 😂 MEME (VERI)
// =====================
client.commands.set("meme", async (interaction) => {
  await interaction.deferReply();

  try {
    const res = await fetch("https://meme-api.com/gimme");
    const data = await res.json();

    await interaction.editReply(`😂 **${data.title}**\n${data.url}`);
  } catch {
    await interaction.editReply("❌ Errore meme");
  }
});

// =====================
// 🎮 MINIGAME
// =====================
client.commands.set("coinflip", async (interaction) => {
  await interaction.deferReply();

  await new Promise(r => setTimeout(r, 2000));

  const result = Math.random() < 0.5 ? "TESTA" : "CROCE";

  await interaction.editReply(`🎮 Risultato: **${result}**`);
});

// =====================
// 🔥 HANDLER
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd(interaction, client);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      await interaction.reply("❌ Errore comando");
    }
  }
});

// =====================
// ✅ READY
// =====================
client.once("ready", () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// =====================
// 🔑 LOGIN
// =====================
client.login(process.env.TOKEN);
