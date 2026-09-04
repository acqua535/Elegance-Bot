// ==========================================
// FILE: clear.js
// ==========================================
const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits, 
    MessageFlags 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Cancella un numero specificato di messaggi dalla chat")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option
                .setName("quantita")
                .setDescription("Numero di messaggi da cancellare (es. 10, 50, 150...)")
                .setRequired(true)
                .setMinValue(1)
        )
        .addUserOption(option =>
            option
                .setName("utente")
                .setDescription("Filtra e cancella solo i messaggi di uno specifico utente")
                .setRequired(false)
        ),

    async execute(interaction) {
        // Controllo permessi
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Devi avere il permesso di **Gestire i Messaggi** per usare questo comando.",
                flags: MessageFlags.Ephemeral
            });
        }

        const amount = interaction.options.getInteger("quantita");
        const targetUser = interaction.options.getUser("utente");

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let totalDeleted = 0;
        let remaining = amount;

        try {
            // Ciclo per eliminare anche più di 100 messaggi alla volta
            while (remaining > 0) {
                const fetchAmount = Math.min(remaining, 100);
                const fetchedMessages = await interaction.channel.messages.fetch({ limit: fetchAmount });

                if (fetchedMessages.size === 0) break;

                // Filtra per utente se specificato
                let messagesToDelete = fetchedMessages;
                if (targetUser) {
                    messagesToDelete = fetchedMessages.filter(m => m.author.id === targetUser.id);
                }

                if (messagesToDelete.size === 0) break;

                // Cancella i messaggi (bulkDelete ignora automaticamente i messaggi più vecchi di 14 giorni)
                const deleted = await interaction.channel.bulkDelete(messagesToDelete, true);
                totalDeleted += deleted.size;
                remaining -= fetchAmount;

                // Se sono stati eliminati meno messaggi del richiesto (es. messaggi troppo vecchi o fine chat), interrompe
                if (deleted.size < fetchAmount && !targetUser) break;
            }

            // Embed di conferma esteticamente curato
            const successEmbed = new EmbedBuilder()
                .setTitle("🧹 Pulizia Chat Completata")
                .setDescription(
                    `L'operazione di moderazione è stata eseguita con successo nel canale ${interaction.channel}!\n\n` +
                    `────────────────────────────────────\n\n` +
                    `📌 **Dettagli Operazione:**\n` +
                    `• **Messaggi eliminati:** \`${totalDeleted}\` / \`${amount}\`\n` +
                    `• **Filtro Utente:** ${targetUser ? targetUser : "`Nessuno (Tutti)`"}\n` +
                    `• **Eseguito da:** ${interaction.user}\n\n` +
                    `────────────────────────────────────`
                )
                .setColor(0x00FF99)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: "Elegance Sponsoring • Moderation System" })
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error(`[CLEAR SYSTEM ❌ ERRORE]:`, error);
            await interaction.editReply({
                content: "❌ **Errore:** Si è verificato un problema durante la cancellazione dei messaggi. Assicurati che i messaggi non siano più vecchi di 14 giorni."
            });
        }
    }
};
