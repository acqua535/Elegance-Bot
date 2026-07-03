const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fetch = require("node-fetch");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// =====================
// 🏓 PING (STABILE)
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
// 😂 MEME REALI
// =====================
client.commands.set("meme", async (interaction) => {
  await interaction.deferReply();

  try {
    const res = await fetch("https://meme-api.com/gimme");
    const data = await res.json();

    return interaction.editReply(`😂 **${data.title}**\n${data.url}`);
  } catch {
    return interaction.editReply("❌ Meme non disponibile");
  }
});

// =====================
// 🎮 MINIGAME (COINFLIP)
// =====================
client.commands.set("coinflip", async (interaction) => {
  await interaction.deferReply();

  await new Promise(r => setTimeout(r, 2000));

  const result = Math.random() < 0.5 ? "TESTA" : "CROCE";

  return interaction.editReply(`🎮 Risultato: **${result}**`);
});

// =====================
// ⚡ HANDLER PERFETTO (FIX “NOT RESPONDING”)
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);

  if (!cmd) {
    return interaction.reply({
      content: "❌ Comando non trovato",
      ephemeral: true
    });
  }

  try {
    await cmd(interaction, client);
  } catch (err) {
    console.error(err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Errore comando",
        ephemeral: true
      });
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
