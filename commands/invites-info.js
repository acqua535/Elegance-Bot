const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { getInvitesData } = require("./invites"); // 👈 Importiamo la nuova funzione dal file invites

const ALLOWED_CHANNEL_ID = "1528576171329982635";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invites-info")
        .setDescription("Mostra il numero di inviti effettuati da te o da un altro utente")
        .addUserOption(opt => 
            opt.setName("utente")
               .setDescription("L'utente di cui vuoi verificare gli inviti")
               .setRequired(false)
        ),

    async execute(interaction) {
        // Controllo Canale Consentito
        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            return interaction.reply({
                content: `❌ **Canale Errato:** Puoi utilizzare questo comando esclusivamente nel canale dedicato <#${ALLOWED_CHANNEL_ID}>!`,
                flags: MessageFlags.Ephemeral
            });
        }

        const target = interaction.options.getUser("utente") || interaction.user;
        
        // 💾 Legge i dati permanenti dal file JSON anziché dalla memoria temporanea
        const allStats = getInvitesData();
        const stats = allStats[target.id] || { total: 0, left: 0, fake: 0 };
        const realInvites = Math.max(0, stats.total - (stats.left || 0) - (stats.fake || 0));

        const embed = new EmbedBuilder()
            .setTitle(`📊 STATISTICHE INVITI ── ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setColor(0x00FF99)
            .addFields(
                { name: "✉️ Inviti Effettivi", value: `**${realInvites}**`, inline: true },
                { name: "📈 Totali Ingressi", value: `${stats.total || 0}`, inline: true },
                { name: "📉 Usciti / Fake", value: `${(stats.left || 0) + (stats.fake || 0)}`, inline: true }
            )
            .setFooter({ text: "Elegance Sponsoring • Invite System" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
