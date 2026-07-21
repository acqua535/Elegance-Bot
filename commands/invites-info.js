const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { userInviteStats } = require("./invites");

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
        const stats = userInviteStats.get(target.id) || { total: 0, left: 0, fake: 0 };
        const realInvites = Math.max(0, stats.total - stats.left - stats.fake);

        const embed = new EmbedBuilder()
            .setTitle(`📊 STATISTICHE INVITI ── ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setColor(0x00FF99)
            .addFields(
                { name: "✉️ Inviti Effettivi", value: `**${realInvites}**`, inline: true },
                { name: "📈 Totali Ingressi", value: `${stats.total}`, inline: true },
                { name: "📉 Usciti / Fake", value: `${stats.left}`, inline: true }
            )
            .setFooter({ text: "Elegance Sponsoring • Invite System" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
