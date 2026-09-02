const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Warn } = require("./Setup");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unwarn")
        .setDescription("Rimuove un avvertimento specifico dallo storico di un utente")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("utente")
                .setDescription("L'utente a cui rimuovere il warn")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("numero")
                .setDescription("Il numero del warn da rimuovere (visibile con /warnings)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("utente");
        const number = interaction.options.getInteger("numero");
        
        const userData = await Warn.findOne({ userId: user.id, guildId: interaction.guild.id });

        if (!userData || userData.warnings.length === 0) {
            return interaction.reply({
                content: `❌ **Attenzione:** L'utente ${user} non ha alcun avvertimento da rimuovere nel database.`,
                flags: MessageFlags.Ephemeral
            });
        }

        if (number < 1 || number > userData.warnings.length) {
            return interaction.reply({
                content: `❌ **Errore di digitazione:** Il numero inserito non è valido. Scegli un valore compreso tra **1** e **${userData.warnings.length}** (puoi verificare la lista esatta usando il comando \`/warnings\`).`,
                flags: MessageFlags.Ephemeral
            });
        }

        // Rimuove l'elemento esatto in base all'indice della lista
        const removed = userData.warnings.splice(number - 1, 1);
        await userData.save();

        const embed = new EmbedBuilder()
            .setTitle("✅ Ristorazione Avvertimento (Unwarn)")
            .setColor("Green")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`Un provvedimento disciplinare è stato ufficialmente rimosso dallo storico dell'utente.`)
            .addFields(
                { name: "👤 Utente Interessato", value: `${user} (\`${user.id}\`)`, inline: false },
                { name: "🛡️ Operatore Staff", value: `${interaction.user}`, inline: true },
                { name: "📊 Warn Rimasti", value: `\` ${userData.warnings.length} \` attivi`, inline: true },
                { name: "🗑️ Dettaglio del Warn Cancellato", value: `> *${removed[0].reason}* (Emesso originariamente da <@${removed[0].moderator}>)`, inline: false }
            )
            .setFooter({ text: "Elegance Sponsoring • Gestione Sicurezza", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
