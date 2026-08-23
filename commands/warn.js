const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { addWarn } = require("../memorySystem");

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

        // Tenta l'aggiunta del Warn nella Memoria Discord
        const result = await addWarn(
            interaction.client,
            user.id,
            interaction.user.id,
            reason
        );

        // Blocco rigido: Max 3 Warn raggiunti
        if (!result.success && result.reason === "MAX_REACHED") {
            return interaction.reply({
                content: `❌ **Impossibile ammonire:** L'utente ${user} ha già raggiunto il limite massimo di **3/3 Warn**!`,
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("⚠️ Warn Assegnato")
            .setColor("Orange")
            .setDescription(
                `👤 **Utente**\n${user}\n\n` +
                `🛡️ **Staff**\n${interaction.user}\n\n` +
                `📝 **Motivo**\n${reason}\n\n` +
                `📊 **Totale Warn**\n\`${result.count}/3\``
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
    
