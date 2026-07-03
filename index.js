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
