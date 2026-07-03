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
// SLASH COMMANDS
// =====================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🏓 Pong!")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("📊 Info server")
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
        .setDescription("Testo")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("🎨 Embed messaggio")
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
    .toJSON(),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("📚 Lista comandi")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// =====================
// READY EVENT
// =====================
client.once("ready", async () => {
  console.log(`Bot online come ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log("Slash commands registrati");
  } catch (err) {
    console.error(err);
  }
});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  if (cmd === "ping") {
    return interaction.reply("🏓 Pong!");
  }

  if (cmd === "serverinfo") {
    return interaction.reply(
      `📊 Server: ${interaction.guild.name}\n👥 Membri: ${interaction.guild.memberCount}`
    );
  }

  if (cmd === "userinfo") {
    return interaction.reply(
      `👤 ${interaction.user.tag}\n🆔 ${interaction.user.id}`
    );
  }

  if (cmd === "say") {
    const text = interaction.options.getString("text");
    return interaction.reply(text);
  }

  if (cmd === "embed") {
    const text = interaction.options.getString("text");
    return interaction.reply({
      embeds: [{ description: text, color: 0x00ffcc }]
    });
  }

  if (cmd === "ban") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.ban();
    return interaction.reply(`⛔ ${user.tag} bannato`);
  }

  if (cmd === "kick") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.kick();
    return interaction.reply(`👢 ${user.tag} kickato`);
  }

  if (cmd === "clear") {
    const amount = interaction.options.getInteger("amount");
    const messages = await interaction.channel.bulkDelete(amount);
    return interaction.reply({
      content: `🧹 Eliminati ${messages.size} messaggi`,
      ephemeral: true
    });
  }

  if (cmd === "minigame") {
    const games = [
      "🎲 Dado: " + Math.ceil(Math.random() * 6),
      "🪙 Moneta: " + (Math.random() > 0.5 ? "Testa" : "Croce")
    ];

    return interaction.reply(games[Math.floor(Math.random() * games.length)]);
  }

  if (cmd === "meme") {
    const memes = [
      "😂 Quando il codice funziona al primo colpo",
      "💀 Io dopo 5 ore di debug",
      "🧠 Errore = esperienza",
      "🔥 Render che non crasha (evento raro)"
    ];

    return interaction.reply(memes[Math.floor(Math.random() * memes.length)]);
  }

  if (cmd === "help") {
    return interaction.reply(
      "📚 /ping /serverinfo /userinfo /say /embed /ban /kick /clear /minigame /meme"
    );
  }
});

client.login(process.env.TOKEN);        .setDescription("Testo da inviare")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("🎨 Messaggio embed semplice")
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
    .setDescription("🎮 Giochi random")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("partner")
    .setDescription("🤝 Registra partner")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("collab")
    .setDescription("🤝 Registra collaborazione")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("feedback")
    .setDescription("📨 Invia feedback")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("Feedback")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("case-search")
    .setDescription("🔎 Cerca caso")
    .addStringOption(option =>
      option.setName("id")
        .setDescription("ID caso")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("verify")
    .setDescription("✔ Verifica utente")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("😂 Meme random")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("📚 Lista comandi")
    .toJSON()
];

// =====================
// REST
// =====================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// =====================
// READY
// =====================
client.once("ready", async () => {
  console.log(`Bot online come ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("Slash commands registrati");
  } catch (err) {
    console.error(err);
  }
});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  // PING
  if (cmd === "ping") {
    return interaction.reply("🏓 Pong!");
  }

  // SERVER INFO
  if (cmd === "serverinfo") {
    return interaction.reply(`📊 Server: ${interaction.guild.name}\n👥 Membri: ${interaction.guild.memberCount}`);
  }

  // USER INFO
  if (cmd === "userinfo") {
    return interaction.reply(`👤 ${interaction.user.tag}\n🆔 ${interaction.user.id}`);
  }

  // SAY
  if (cmd === "say") {
    const text = interaction.options.getString("text");
    return interaction.reply(text);
  }

  // EMBED
  if (cmd === "embed") {
    const text = interaction.options.getString("text");
    return interaction.reply({
      embeds: [{ description: text, color: 0x00ffcc }]
    });
  }

  // BAN
  if (cmd === "ban") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.ban();
    return interaction.reply(`⛔ ${user.tag} bannato`);
  }

  // KICK
  if (cmd === "kick") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.kick();
    return interaction.reply(`👢 ${user.tag} kickato`);
  }

  // CLEAR
  if (cmd === "clear") {
    const amount = interaction.options.getInteger("amount");
    const messages = await interaction.channel.bulkDelete(amount);
    return interaction.reply({ content: `🧹 Eliminati ${messages.size} messaggi`, ephemeral: true });
  }

  // MINIGAME
  if (cmd === "minigame") {
    const games = ["🎲 Dado: " + Math.ceil(Math.random() * 6), "🪙 Moneta: " + (Math.random() > 0.5 ? "Testa" : "Croce")];
    return interaction.reply(games[Math.floor(Math.random() * games.length)]);
  }

  // PARTNER
  if (cmd === "partner") {
    return interaction.reply("🤝 Partner registrato (base system)");
  }

  // COLLAB
  if (cmd === "collab") {
    return interaction.reply("🤝 Collaborazione registrata (base system)");
  }

  // FEEDBACK
  if (cmd === "feedback") {
    const text = interaction.options.getString("text");
    return interaction.reply("📨 Feedback ricevuto: " + text);
  }

  // CASE SEARCH
  if (cmd === "case-search") {
    const id = interaction.options.getString("id");
    return interaction.reply(`🔎 Caso #${id} non trovato (demo system)`);
  }

  // VERIFY
  if (cmd === "verify") {
    return interaction.reply("✔ Verificato (demo system)");
  }

  // MEME
  if (cmd === "meme") {
    const memes = [
      "😂 Quando il codice funziona al primo colpo",
      "💀 Io dopo 5 ore di debug",
      "🧠 Errori = esperienza",
      "🔥 Render che non crasha (miracolo)"
    ];
    return interaction.reply(memes[Math.floor(Math.random() * memes.length)]);
  }

  // HELP
  if (cmd === "help") {
    return interaction.reply("📚 /ping /ban /kick /clear /minigame /meme /say /embed /feedback /serverinfo /userinfo /verify /partner /collab /case-search");
  }
});

client.login(process.env.TOKEN);      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("Slash commands registrati");
  } catch (err) {
    console.error(err);
  }
});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // /ping
  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong!");
  }

  // /serverinfo
  if (interaction.commandName === "serverinfo") {
    await interaction.reply(
      `📊 Server: ${interaction.guild.name}\n👥 Membri: ${interaction.guild.memberCount}`
    );
  }

  // /userinfo
  if (interaction.commandName === "userinfo") {
    await interaction.reply(
      `👤 Utente: ${interaction.user.tag}\n🆔 ID: ${interaction.user.id}`
    );
  }
});

client.login(process.env.TOKEN);
