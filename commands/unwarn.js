const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const moderation = require("./moderationSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unwarn")
        .setDescription("Rimuove un warn da un utente")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("utente")
                .setDescription("Utente")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("numero")
                .setDescription("Numero del warn da rimuovere")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("utente");
        const number = interaction.options.getInteger("numero");
        const warnings = moderation.getWarnings(user.id);

        if (warnings.length === 0) {
            return interaction.reply({
                content: "❌ Questo utente non ha warn.",
                ephemeral: true
            });
        }

        if (number < 1 || number > warnings.length) {
            return interaction.reply({
                content: `❌ Inserisci un numero da 1 a ${warnings.length}.`,
                ephemeral: true
            });
        }

        const removed = warnings.splice(number - 1, 1);
        moderation.updateWarnings(user.id, warnings);

        const embed = new EmbedBuilder()
            .setTitle("✅ Warn rimosso")
            .setColor("Green")
            .setDescription(
                `👤 **Utente**\n${user}\n\n` +
                `🛡️ **Rimosso da**\n${interaction.user}\n\n` +
                `📝 **Motivo rimosso**\n${removed[0].reason}\n\n` +
                `📊 **Warn rimasti**\n${warnings.length}`
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
