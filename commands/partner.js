const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

// ID CONFIGURATION (Elegance Sponsoring)
const PARTNER_CHANNEL_ID = "1528576179177787642";
const LOG_CHANNEL_ID     = "1528576197741772902";
const ALLOWED_ROLE_ID    = "1528576031680630804";
const PING_ROLE_ID       = "1528576041206022204";

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
                    { name: "🚗 FiveM", value: "🚗 FiveM" }
                )
        )
        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Testo/Invito del server partner")
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Non hai il ruolo necessario per eseguire questo comando!**",
                flags: MessageFlags.Ephemeral
            });
        }

        const rappresentante = interaction.options.getUser("richiesta_da");
        const categoria = interaction.options.getString("categoria");

        const descrizione = interaction.options.getString("descrizione")
            .replace(/@everyone/g, "everyone")
            .replace(/@here/g, "here");

        const partnerChannel = interaction.guild.channels.cache.get(PARTNER_CHANNEL_ID);
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (!partnerChannel) {
            return interaction.reply({
                content: "❌ **Errore:** Canale Partnership non trovato.",
                flags: MessageFlags.Ephemeral
            });
        }

        // Primo messaggio: Testo della partner
        await partnerChannel.send({ content: descrizione });

        // Secondo messaggio: Blocco info + Ping
        const infoMessage = `🤝 **ELEGANCE SPONSORING ── PARTNERSHIP**\n` +
                            `🏷️ **Categoria:** \`${categoria}\`\n` +
                            `📌 **Rappresentante:** ${rappresentante}\n` +
                            `👤 **Pubblicato da:** ${interaction.user}\n` +
                            `🐚 **Ping Role:** <@&${PING_ROLE_ID}>`;

        await partnerChannel.send({ content: infoMessage });

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
