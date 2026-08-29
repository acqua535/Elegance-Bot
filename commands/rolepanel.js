// ==========================================
// FILE: commands/rolepanel.js
// ==========================================
const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    PermissionFlagsBits, 
    MessageFlags 
} = require("discord.js");

const AGE_ROLES = [
    "1528576061963632663", // 14-17
    "1528576063272124476"  // 18+
];
const EXTRA_ROLE = "1528576060667723936";

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
    },

    async selectMenuHandler(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

        try {
            const member = interaction.member;
            const selectedValue = interaction.values[0];

            // Rimuove i ruoli età correnti e il ruolo collegato
            await member.roles.remove([...AGE_ROLES, EXTRA_ROLE]).catch((err) => {
                console.error("[ROLEPANEL] Errore durante la rimozione dei ruoli:", err);
            });

            // Opzione Reset
            if (selectedValue === "age_reset") {
                return await interaction.editReply({
                    content: "🗑️ **Ruolo Età rimosso con successo!**"
                });
            }

            // Assegnazione del ruolo selezionato assieme al ruolo dedicato
            await member.roles.add([selectedValue, EXTRA_ROLE]);

            return await interaction.editReply({
                content: `✅ **Ruolo <@&${selectedValue}> assegnato con successo!**`
            });
        } catch (error) {
            console.error("🚨 Errore gestione menu ruoli:", error);
            return await interaction.editReply({
                content: "❌ **Impossibile assegnare il ruolo.** Assicurati che il ruolo del Bot sia posizionato sopra tutti i ruoli da assegnare nelle Impostazioni del Server -> Ruoli!"
            }).catch(() => {});
        }
    }
};
