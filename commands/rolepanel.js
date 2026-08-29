const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    PermissionFlagsBits, 
    MessageFlags 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolepanel")
        .setDescription("Invia il pannello per la selezione dei ruoli (AGE ZONE)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("🔞 ELEGANCE SPONSORING ── AGE ZONE")
            .setDescription(
                "Seleziona la tua fascia d'età dal menu a tendina sottostante per personalizzare il tuo profilo!\n\n" +
                "📚 **. 14-17**\n" +
                "🥂 **. 18+**\n\n" +
                "⚠️ *Nota: Puoi avere solo un ruolo età attivo alla volta.*"
            )
            .setColor(0x2B2D31)
            .setFooter({ text: "Elegance Sponsoring • Role System" });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("select_age_zone")
            .setPlaceholder("🔞 Seleziona la tua fascia d'età...")
            .addOptions([
                {
                    label: "Togli l'età",
                    value: "age_reset",
                    description: "Rimuove il ruolo età attualmente attivo",
                    emoji: "❌"
                },
                {
                    label: ". 14-17",
                    value: "1528576061963632663",
                    description: "Fascia d'età 14-17 anni",
                    emoji: "📚"
                },
                {
                    label: ". 18+",
                    value: "1528576063272124476",
                    description: "Fascia d'età 18+ anni",
                    emoji: "🥂"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.channel.send({ embeds: [embed], components: [row] });

        return interaction.reply({
            content: "✅ **Pannello AGE ZONE inviato con successo!**",
            flags: MessageFlags.Ephemeral
        });
    }
};
