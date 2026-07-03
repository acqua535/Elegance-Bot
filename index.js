const {
  Client,
  GatewayIntentBits,
  Collection
} = require("discord.js");

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
// 😂 MEME
// =====================
client.commands.set("meme", async (interaction) => {
  await interaction.deferReply();

  try {
    const res = await fetch("https://meme-api.com/gimme");
    const data = await res.json();

    await interaction.editReply(`😂 **${data.title}**\n${data.url}`);
  } catch {
    await interaction.editReply("❌ Meme non disponibile");
  }
});

// =====================
// 🎮 COINFLIP
// =====================
client.commands.set("coinflip", async (interaction) => {
  await interaction.deferReply();

  const result = Math.random() < 0.5 ? "TESTA" : "CROCE";

  await interaction.editReply(`🎮 ${result}`);
});

// =====================
// 👤 USERINFO
// =====================
client.commands.set("userinfo", async (interaction) => {
  await interaction.deferReply();

  const user = interaction.user;

  await interaction.editReply(
    `👤 USER INFO\nUsername: ${user.username}\nID: ${user.id}`
  );
});

// =====================
// 🏠 SERVERINFO
// =====================
client.commands.set("serverinfo", async (interaction) => {
  await interaction.deferReply();

  const guild = interaction.guild;

  await interaction.editReply(
    `🏠 SERVER INFO\nNome: ${guild.name}\nMembri: ${guild.memberCount}`
  );
});

// =====================
// 💬 SAY
// =====================
client.commands.set("say", async (interaction) => {
  await interaction.deferReply();

  const msg = interaction.options.getString("message");

  await interaction.editReply(msg);
});

// =====================
// 🧹 CLEAR (SIMPLE)
// =====================
client.commands.set("clear", async (interaction) => {
  await interaction.deferReply();

  await interaction.editReply("🧹 Clear eseguito (demo base)");
});

// =====================
// ⚡ HANDLER STABILE
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
// 🚀 READY
// =====================
client.once("ready", () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

// =====================
// 🔑 LOGIN
// =====================
client.login(process.env.TOKEN);
