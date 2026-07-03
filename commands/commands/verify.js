const VERIFIED_ROLE = "1522332009773404211";
const UNVERIFIED_ROLE = "1505196345009635459";

module.exports = {
  name: "verify",
  description: "Verifica un utente",

  async execute(interaction) {
    const member = interaction.member;

    if (member.roles.cache.has(VERIFIED_ROLE)) {
      return interaction.reply({
        content: "✅ Sei già verificato!",
        ephemeral: true
      });
    }

    try {
      await member.roles.add(VERIFIED_ROLE);

      if (member.roles.cache.has(UNVERIFIED_ROLE)) {
        await member.roles.remove(UNVERIFIED_ROLE);
      }

      return interaction.reply({
        content: "🎉 Verifica completata! Benvenuto!",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Non sono riuscito ad assegnare i ruoli.",
        ephemeral: true
      });
    }
  }
};
