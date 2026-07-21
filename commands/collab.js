const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

// ID CONFIGURATION (Elegance Sponsoring)
const COLLAB_CHANNEL_ID  = "1528576181295906826";
const LOG_CHANNEL_ID     = "1528576197741772902";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("collab")
        .setDescription("Pubblica una nuova Collaborazione")
        .addUserOption(option =>
            option
                .setName("richiesta_da")
                .setDescription("Utente che ha richiesto la collaborazione")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("categoria")
                .setDescription("Categoria della collaborazione")
                .setRequired(true)
                .addChoices(
                    { name: "🌐 Community", value: "🌐 Community" },
                    { name: "🎮 Gaming", value: "🎮 Gaming" },
                    { name: "🎭 Roleplay", value: "🎭 Roleplay" },
                    { name: "🚗 FiveM", value: "🚗 FiveM" },
                    { name: "📢 Media / Content Creator", value: "📢 Media / Content Creator" }
                )
        )
        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Dettagli della collaborazione")
                .setRequired(true)
        ),

    async execute(interaction) {
        const richiesta = interaction.options.getUser("richiesta_da");
        const categoria = interaction.options.getString("categoria");
        const descrizione = interaction.options.getString("descrizione");

        const collabChannel = interaction.guild.channels.cache.get(COLLAB_CHANNEL_ID);
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (!collabChannel) {
            return interaction.reply({
                content: "❌ **Errore:** Canale Collaborazioni non trovato.",
                flags: MessageFlags.Ephemeral
            });
        }

        // 1. EMBED PUBBLICO
        const publicEmbed = new EmbedBuilder()
            .setTitle("✨ ELEGANCE SPONSORING ── COLLABORAZIONE")
            .setColor(0x00C8FF)
            .setDescription(descrizione)
            .addFields(
                { name: "🏷️ Categoria", value: `\`${categoria}\``, inline: true },
                { name: "📌 Richiesta da", value: `${richiesta}`, inline: true },
                { name: "👤 Staffer", value: `${interaction.user}`, inline: true }
            )
            .setFooter({ text: "Elegance Sponsoring • Official Collaboration", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await collabChannel.send({ embeds: [publicEmbed] });

        // 2. EMBED LOG
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle("📋 LOG COLLABORAZIONE REGISTRATA")
                .setColor(0x00C8FF)
                .setThumbnail(richiesta.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Esecutore Staff", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: false },
                    { name: "📌 Richiesta da", value: `${richiesta} (\`${richiesta.id}\`)`, inline: false },
                    { name: "🏷️ Categoria", value: categoria, inline: true },
                    { name: "📌 Canale Destinazione", value: `<#${COLLAB_CHANNEL_ID}>`, inline: true },
                    { name: "📝 Descrizione", value: descrizione.length > 500 ? descrizione.substring(0, 500) + "..." : descrizione, inline: false }
                )
                .setFooter({ text: "System Logs • Collaboration" })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }

        return interaction.reply({
            content: `✅ **Collaborazione pubblicata con successo in** <#${COLLAB_CHANNEL_ID}>!`,
            flags: MessageFlags.Ephemeral
        });
    }
};
