const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// COMMANDS CONTAINER
client.commands = new Collection();

// ===== COMMANDS =====
client.commands.set("ping", async (interaction) => {
  const msg = await interaction.reply({ content: "🏓 Ping...", fetchReply: true });

  const ping = msg.createdTimestamp - interaction.createdTimestamp;

  interaction.editReply(`🏓 Pong!\n⏱️ ${ping}ms`);
});

// VERIFY
const VERIFIED_ROLE = "1522332009773404211";
const UNVERIFIED_ROLE = "1505196345009635459";

client.commands.set("verify", async (interaction) => {
  const member = interaction.member;

  if (member.roles.cache.has(VERIFIED_ROLE)) {
    return interaction.reply("✅ Già verificato");
  }

  await member.roles.add(VERIFIED_ROLE);
  if (member.roles.cache.has(UNVERIFIED_ROLE)) {
    await member.roles.remove(UNVERIFIED_ROLE);
  }

  return interaction.reply("🎉 Verificato!");
});

// CASE SEARCH (base)
const cases = {};

client.commands.set("case-search", async (interaction) => {
  const id = interaction.options.getString("id");

  if (!cases[id]) {
    return interaction.reply("❌ Caso non trovato");
  }

  return interaction.reply(`📁 ${cases[id]}`);
});

// ===== EVENT HANDLER =====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd(interaction);
  } catch (err) {
    console.error(err);
    interaction.reply("❌ Errore comando");
  }
});

// READY
client.once("ready", () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// LOGIN
client.login(process.env.TOKEN);
