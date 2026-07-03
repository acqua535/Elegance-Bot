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

client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const ticket = client.commands.get("ticket");
  if (!ticket) return;

  if (
    interaction.customId === "ticket_support" ||
    interaction.customId === "ticket_partner" ||
    interaction.customId === "ticket_collab" ||
    interaction.customId === "ticket_staff"
  ) {
    return ticket.buttonHandler(interaction);
  }

  if (interaction.customId === "ticket_close") {
    return ticket.closeHandler(interaction);
  }
});

client.login(process.env.TOKEN);
