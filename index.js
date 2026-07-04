if (interaction.isButton()) {
  const ticket = client.commands.get("ticket");
  if (!ticket) return;

  try {
    if (interaction.customId === "ticket_open") {
      return await ticket.open(interaction);
    }

    if (interaction.customId === "ticket_take") {
      return await ticket.take(interaction);
    }

    if (interaction.customId === "ticket_close") {
      return await ticket.close(interaction);
    }
  } catch (err) {
    console.error("Button error:", err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Errore bottone",
        ephemeral: true
      });
    }
  }
}
