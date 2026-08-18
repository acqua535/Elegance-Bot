const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

// ID CONFIGURATION (Elegance Sponsoring)
const PARTNER_CHANNEL_ID = "1528576179177787642";
const LOG_CHANNEL_ID     = "1528576197741772902";
const ALLOWED_ROLE_ID    = "1528576031680630804";

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
        // Controllo Permesso Ruolo
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Non hai il ruolo necessario per eseguire questo comando!**",
                flags: MessageFlags.Ephemeral
            });
        }

        const rappresentante = interaction.options.getUser("richiesta_da");
        const categoria = interaction.options.getString("categoria");
        const rawDescrizione = interaction.options.getString("descrizione");

        // Rimuove i ping di massa per evitare notifiche indesiderate
        const descrizione = rawDescrizione
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

        // 1. PRIMO MESSAGGIO PUBBLICO: Solo descrizione pulita con blocco notifiche API
        await partnerChannel.send({ 
            content: descrizione,
            allowedMentions: { parse: [] } 
        });

        // 2. SECONDO MESSAGGIO PUBBLICO: Dettagli in testo semplice
        const infoMessage = `🤝 **ELEGANCE SPONSORING ── PARTNERSHIP**\n` +
                            `🏷️ **Categoria:** \`${categoria}\`\n` +
                            `📌 **Rappresentante:** ${rappresentante}\n` +
                            `👤 **Pubblicato da:** ${interaction.user}`;

        await partnerChannel.send({ content: infoMessage });

        // 3. LOG PRIVATO PER LO STAFF (Embed)
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
                
