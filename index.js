const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// =====================
// SLASH COMMANDS
// =====================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Risponde Pong!")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Mostra info del server")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Mostra info utente")
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
