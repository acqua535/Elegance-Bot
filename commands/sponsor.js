const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

// ID CONFIGURATION (Elegance Sponsoring)
const SPONSOR_CHANNEL_ID = "1528576184785305600";
const LOG_CHANNEL_ID     = "1528576197741772902";
const ALLOWED_ROLE_ID    = "1528576014446231683";

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
                .setDescription("Pacchetto / Tipologia della sponsorizzazione")
                .setRequired(true)
                .addChoices(
                    { name: "✧ ʙᴀsɪᴄ (24h Annunci)", value: "✧ ʙᴀsɪᴄ ─── Sponsorizzazione in evidenza nel canale annunci per 24 ore." },
                    { name: "✧ sᴛᴀɴᴅᴀʀᴅ (Ping @everyone / @here + 3 giorni)", value: "✧ sᴛᴀɴᴅᴀʀᴅ ─── Ping generale (@everyone / @here) + sponsorizzazione fissata per 3 giorni." },
                    { name: "✧ ᴘʀᴇᴍɪᴜM (Ping + 1 Settimana + Banner)", value: "✧ ᴘʀᴇᴍɪᴜM ─── Pacchetto completo: ping generale, sponsorizzazione fissata per 1 settimana + banner." },
                    { name: "✧ ᴄᴜsᴛᴏᴍ (Soluzione personalizzata)", value: "✧ ᴄᴜsᴛᴏᴍ ─── Soluzioni personalizzate a lungo termine." }
                )
        )
        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Contenuto promozionale dello sponsor")
                .setRequired(true)
        ),

    async execute(interaction) {
        // Controllo Permesso Ruolo
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Non hai il ruolo necessario per eseguire questo comando!**",
                flags: MessageFlags.Ephemeral
            });
        }

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

        // 1. PRIMO MESSAGGIO PUBBLICO: Solo descrizione pura
        await sponsorChannel.send({ content: descrizione });

        // 2. SECONDO MESSAGGIO PUBBLICO: Dettagli in testo semplice
        const infoMessage = `💎 **ELEGANCE SPONSORING ── SPONSORSHIP**\n` +
                            `⭐ **Pacchetto Sponsor:** \`${tipoSponsor}\`\n` +
                            `📌 **Sponsorizzato:** ${sponsorizzato}\n` +
                            `👤 **Manager:** ${interaction.user}`;

        await sponsorChannel.send({ content: infoMessage });

        // 3. LOG PRIVATO PER LO STAFF (Embed)
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle("📋 LOG SPONSORSHIP REGISTRATA")
                .setColor(0xFFD700)
                .setThumbnail(sponsorizzato.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Esecutore Staff", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: false },
                    { name: "💎 Sponsorizzato", value: `${sponsorizzato} (\`${sponsorizzato.id}\`)`, inline: false },
                    { name: "⭐ Pacchetto scelto", value: tipoSponsor, inline: false },
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
