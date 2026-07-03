    const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

client.once(Events.ClientReady, () => {
  console.log(`✅ Online come ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "❌ Errore comando", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
