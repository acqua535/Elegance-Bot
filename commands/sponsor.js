const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

// ID CONFIGURATION (Elegance Sponsoring)
const SPONSOR_CHANNEL_ID = "1528576184785305600";
const LOG_CHANNEL_ID     = "1528576197741772902";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sponsor")
        .setDescription("Pubblica uno Sponsor Ufficiale")
        .addUserOption(option =>
            option
                .setName("sponsorizzato")
                .setDescription("Utente/Cliente sponsorizzato")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("tipo_sponsor")
                .setDescription("Tipologia della sponsorizzazione")
                .setRequired(true)
                .addChoices(
                    { name: "⚡ Premium Sponsor", value: "⚡ Premium Sponsor" },
                    { name: "🏆 Diamond Sponsor", value: "🏆 Diamond Sponsor" },
                    { name: "💎 Gold Sponsor", value: "💎 Gold Sponsor" },
                    { name: "🚀 Official Partner", value: "🚀 Official Partner" }
                )
        )
        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Contenuto promozionale dello sponsor")
                .setRequired(true)
        ),

    async execute(interaction) {
        const sponsorizzato = interaction.options.getUser("sponsorizzato");
        const tipoSponsor = interaction.options.getString("tipo_sponsor");
        const descrizione = interaction.options.getString("descrizione");

        const sponsorChannel = interaction.guild.channels.cache.get(SPONSOR_CHANNEL_ID);
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (!sponsorChannel) {
            return interaction.reply({
                content: "❌ **Errore:** Canale Sponsorship non trovato.",
                flags: MessageFlags.Ephemeral
            });
        }

        // 1. EMBED PUBBLICO
        const publicEmbed = new EmbedBuilder()
            .setTitle("💎 ELEGANCE SPONSORING ── SPONSORSHIP")
            .setColor(0xFFD700)
            .setDescription(descrizione)
            .addFields(
                { name: "⭐ Livello Sponsor", value: `\`${tipoSponsor}\``, inline: true },
                { name: "📌 Sponsorizzato", value: `${sponsorizzato}`, inline: true },
                { name: "👤 Manager", value: `${interaction.user}`, inline: true }
            )
            .setFooter({ text: "Elegance Sponsoring • Official Sponsorship", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await sponsorChannel.send({ embeds: [publicEmbed] });

        // 2. EMBED LOG
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle("📋 LOG SPONSORSHIP REGISTRATA")
                .setColor(0xFFD700)
                .setThumbnail(sponsorizzato.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Esecutore Staff", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: false },
                    { name: "💎 Sponsorizzato", value: `${sponsorizzato} (\`${sponsorizzato.id}\`)`, inline: false },
                    { name: "⭐ Livello", value: tipoSponsor, inline: true },
                    { name: "📌 Canale Destinazione", value: `<#${SPONSOR_CHANNEL_ID}>`, inline: true },
                    { name: "📝 Contenuto Promo", value: descrizione.length > 500 ? descrizione.substring(0, 500) + "..." : descrizione, inline: false }
                )
                .setFooter({ text: "System Logs • Sponsorship" })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }

        return interaction.reply({
            content: `✅ **Sponsorship pubblicata con successo in** <#${SPONSOR_CHANNEL_ID}>!`,
            flags: MessageFlags.Ephemeral
        });
    }
};
