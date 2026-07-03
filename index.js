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
// COMMANDS
// =====================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🏓 Mostra latenza del bot")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("📊 Info del server")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 Info utente")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("💬 Il bot ripete il messaggio")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("Testo da inviare")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("🎨 Messaggio embed")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("Testo embed")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("⛔ Bannare utente")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Utente")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("👢 Kick utente")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Utente")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("🧹 Cancella messaggi")
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Numero messaggi")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("minigame")
    .setDescription("🎮 Gioco random")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("😂 Meme random")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// =====================
// READY
// =====================
client.once("ready", async () => {
  console.log(`✅ Online come ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log("📌 Slash commands registrati");
  } catch (err) {
    console.error("Errore registrazione comandi:", err);
  }
});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.guild) return;

  const cmd = interaction.commandName;

  try {

    // =====================
    // 🏓 PING MIGLIORATO
    // =====================
    if (cmd === "ping") {
      const sent = await interaction.reply({
        content: "🏓 Calcolo ping...",
        fetchReply: true
      });

      const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = client.ws.ping;

      let quality = "🟢 Ottimo";
      if (apiLatency > 200) quality = "🟡 Medio";
      if (apiLatency > 400) quality = "🔴 Alto";

      return interaction.editReply(
        `🏓 **Pong!**\n` +
        `📡 Bot: ${botLatency}ms\n` +
        `🤖 API: ${apiLatency}ms\n` +
        `📊 Stato: ${quality}`
      );
    }

    // =====================
    // SERVER INFO
    // =====================
    if (cmd === "serverinfo") {
      return interaction.reply(
        `📊 **${interaction.guild.name}**\n👥 Membri: ${interaction.guild.memberCount}`
      );
    }

    // =====================
    // USER INFO
    // =====================
    if (cmd === "userinfo") {
      return interaction.reply(
        `👤 ${interaction.user.tag}\n🆔 ${interaction.user.id}`
      );
    }

    // =====================
    // SAY
    // =====================
    if (cmd === "say") {
      return interaction.reply(interaction.options.getString("text"));
    }

    // =====================
    // EMBED
    // =====================
    if (cmd === "embed") {
      return interaction.reply({
        embeds: [{
          description: interaction.options.getString("text"),
          color: 0x2bffcc
        }]
      });
    }

    // =====================
    // BAN
    // =====================
    if (cmd === "ban") {
      const user = interaction.options.getUser("user");
      const member = await interaction.guild.members.fetch(user.id);
      await member.ban();
      return interaction.reply(`⛔ ${user.tag} bannato`);
    }

    // =====================
    // KICK
    // =====================
    if (cmd === "kick") {
      const user = interaction.options.getUser("user");
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick();
      return interaction.reply(`👢 ${user.tag} kickato`);
    }

    // =====================
    // CLEAR
    // =====================
    if (cmd === "clear") {
      const amount = interaction.options.getInteger("amount");
      const deleted = await interaction.channel.bulkDelete(amount, true);
      return interaction.reply({
        content: `🧹 Eliminati ${deleted.size} messaggi`,
        ephemeral: true
      });
    }

    // =====================
    // MINIGAME
    // =====================
    if (cmd === "minigame") {
      const games = [
        `🎲 Dado: ${Math.ceil(Math.random() * 6)}`,
        `🪙 Moneta: ${Math.random() > 0.5 ? "Testa" : "Croce"}`
      ];
      return interaction.reply(games[Math.floor(Math.random() * games.length)]);
    }

    // =====================
    // MEME
    // =====================
    if (cmd === "meme") {
      const memes = [
        "😂 Quando funziona al primo colpo",
        "💀 5 ore di debug per una virgola",
        "🧠 Errori = esperienza",
        "🔥 Render: oggi non crasho"
      ];
      return interaction.reply(memes[Math.floor(Math.random() * memes.length)]);
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      return interaction.reply("❌ Errore nel comando.");
    }
  }
});

client.login(process.env.TOKEN);
