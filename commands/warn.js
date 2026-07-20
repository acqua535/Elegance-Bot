const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const moderation = require("./moderationSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Assegna un avvertimento ad un utente")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("utente")
                .setDescription("Utente da avvertire")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Motivo dell'avvertimento")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("utente");
        const reason = interaction.options.getString("motivo");

        const total = moderation.addWarning(
            user.id,
            interaction.user.id,
            reason
        );

        const embed = new EmbedBuilder()
            .setTitle("⚠️ Warn assegnato")
            .setColor("Orange")
            .setDescription(
                `👤 **Utente**\n${user}\n\n` +
                `🛡️ **Staff**\n${interaction.user}\n\n` +
                `📝 **Motivo**\n${reason}\n\n` +
                `📊 **Totale Warn**\n${total}`
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
