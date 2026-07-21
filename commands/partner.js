const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

// ID CONFIGURATION (Elegance Sponsoring)
const PARTNER_CHANNEL_ID = "1528576179177787642";
const LOG_CHANNEL_ID     = "1528576197741772902";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("partner")
        .setDescription("Pubblica una nuova Partnership ufficiale")
        .addUserOption(option =>
            option
                .setName("richiesta_da")
                .setDescription("Rappresentante del server partner")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("categoria")
                .setDescription("Categoria del server partner")
                .setRequired(true)
                .addChoices(
                    { name: "🌐 Community", value: "🌐 Community" },
                    { name: "🎮 Gaming", value: "🎮 Gaming" },
                    { name: "🎭 Roleplay", value: "🎭 Roleplay" },
                    { name: "🚗 FiveM", value: "🚗 FiveM" },
                    { name: "💼 Business / Tech", value: "💼 Business / Tech" }
                )
        )
        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Testo/Invito del server partner")
                .setRequired(true)
        ),

    async execute(interaction) {
        const rappresentante = interaction.options.getUser("richiesta_da");
        const categoria = interaction.options.getString("categoria");
        const descrizione = interaction.options.getString("descrizione");

        const partnerChannel = interaction.guild.channels.cache.get(PARTNER_CHANNEL_ID);
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (!partnerChannel) {
            return interaction.reply({
                content: "❌ **Errore:** Canale Partnership non trovato.",
                flags: MessageFlags.Ephemeral
            });
        }

        // 1. EMBED PUBBLICO (Pulito ed Elegante)
        const publicEmbed = new EmbedBuilder()
            .setTitle("🤝 ELEGANCE SPONSORING ── PARTNERSHIP")
            .setColor(0x00FF99)
            .setDescription(descrizione)
            .addFields(
                { name: "🏷️ Categoria", value: `\`${categoria}\``, inline: true },
                { name: "📌 Rappresentante", value: `${rappresentante}`, inline: true },
                { name: "👤 Pubblicato da", value: `${interaction.user}`, inline: true }
            )
            .setFooter({ text: "Elegance Sponsoring • Official Partnership", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await partnerChannel.send({ embeds: [publicEmbed] });

        // 2. EMBED LOG (Privato Staff)
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle("📋 LOG PARTNERSHIP REGISTRATA")
                .setColor(0x00FF99)
                .setThumbnail(rappresentante.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Esecutore Staff", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: false },
                    { name: "🤝 Partner / Utente", value: `${rappresentante} (\`${rappresentante.id}\`)`, inline: false },
                    { name: "🏷️ Categoria", value: categoria, inline: true },
                    { name: "📌 Canale Destinazione", value: `<#${PARTNER_CHANNEL_ID}>`, inline: true },
                    { name: "📝 Testo Inviato", value: descrizione.length > 500 ? descrizione.substring(0, 500) + "..." : descrizione, inline: false }
                )
                .setFooter({ text: "System Logs • Partnership" })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }

        return interaction.reply({
            content: `✅ **Partnership pubblicata con successo in** <#${PARTNER_CHANNEL_ID}>!`,
            flags: MessageFlags.Ephemeral
        });
    }
};
                
