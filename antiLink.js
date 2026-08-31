// ==========================================
// FILE: antiLink.js (VERSIONE UNICA COMPLETA MONGOOSE)
// ==========================================
const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} = require("discord.js");

// 🛡️ Import diretto e pulito dalla root principale
const { Setup } = require("./Setup");
const moderation = require("./moderationSystem");

const STAFF_ROLE_ID = "1528576014446231683";
const ALLOWED_ROLE_ID = "1528576014446231683";

const ALLOWED_CHANNELS = [
    "1528576184785305600",
    "1528576181295906826",
    "1528576179177787642"
];

// Helper salvataggio MongoDB
const saveAntiLinkSetup = async (guildId, data) => {
    try {
        const updateData = {};
        if (data.enabled !== undefined) updateData.antiLinkEnabled = data.enabled;
        if (data.logChannel !== undefined) updateData.antiLinkLogChannel = data.logChannel;

        return await Setup.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { upsert: true, new: true }
        );
    } catch (e) {
        console.error("[MONGO ERROR] Errore salvataggio Anti-Link:", e);
        return null;
    }
};

// Helper lettura da MongoDB
const getGuildConfig = async (guildId) => {
    if (!guildId) return { enabled: false, logChannel: null };
    try {
        let setup = await Setup.findOne({ guildId });
        if (!setup) {
            setup = await Setup.create({ guildId, antiLinkEnabled: false, antiLinkLogChannel: null });
        }
        return {
            enabled: setup.antiLinkEnabled ?? false,
            logChannel: setup.antiLinkLogChannel || null
        };
    } catch (e) {
        console.error("[MONGO ERROR] Errore lettura Anti-Link:", e);
        return { enabled: false, logChannel: null };
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("antilink")
        .setDescription("Gestisci il sistema Anti-Link e imposta il canale di log"),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per eseguire questo comando.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = await getGuildConfig(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("🛡️ ELEGANCE SPONSORING ── PANNELLO ANTI-LINK")
            .setDescription(
                "Configura la protezione automatica contro i link non autorizzati.\n\n" +
                `📌 **Canale Log Impostato:** ${config.logChannel ? `<#${config.logChannel}>` : "`Non impostato`"}\n` +
                `⚡ **Stato Anti-Link:** ${config.enabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(config.enabled ? 0x57F287 : 0xED4245)
            .setFooter({ text: "Elegance Sponsoring • System Security" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("antilink_toggle")
                .setLabel(config.enabled ? "Disattiva Anti-Link" : "Attiva Anti-Link")
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("antilink_set_channel")
                .setLabel("📌 Imposta Canale Corrente per i Log")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },

    async buttonHandler(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi i permessi per usare questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        const { customId, channel, guild } = interaction;
        let config = await getGuildConfig(guild.id);

        if (customId === "antilink_toggle") {
            config.enabled = !config.enabled;
            await saveAntiLinkSetup(guild.id, { enabled: config.enabled });
        } else if (customId === "antilink_set_channel") {
            config.logChannel = channel.id;
            await saveAntiLinkSetup(guild.id, { logChannel: channel.id });
        }

        const embed = new EmbedBuilder()
            .setTitle("🛡️ ELEGANCE SPONSORING ── PANNELLO ANTI-LINK")
            .setDescription(
                "Impostazioni salvate con successo su MongoDB Cloud!\n\n" +
                `📌 **Canale Log Impostato:** ${config.logChannel ? `<#${config.logChannel}>` : "`Non impostato`"}\n` +
                `⚡ **Stato Anti-Link:** ${config.enabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(config.enabled ? 0x57F287 : 0xED4245)
            .setFooter({ text: "Elegance Sponsoring • System Security" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("antilink_toggle")
                .setLabel(config.enabled ? "Disattiva Anti-Link" : "Attiva Anti-Link")
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("antilink_set_channel")
                .setLabel("📌 Imposta Canale Corrente per i Log")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ embeds: [embed], components: [row] });
    },

    initEvents(client) {
        client.on("messageCreate", async (message) => {
            try {
                if (message.author?.bot || !message.guild) return;

                const config = await getGuildConfig(message.guild.id);
                if (!config.enabled) return;

                if (ALLOWED_CHANNELS.includes(message.channel.id)) return;
                if (message.member?.roles.cache.has(ALLOWED_ROLE_ID)) return;

                const content = message.content;
                if (!content) return;

                const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(discord\.(gg|io|me|li|com\/invite)\/[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|edu|gov|mil|int|biz|info|name|pro|tech|xyz|online|site|store|app|dev|io|co|it|fr|de|uk|es|ru|eu|me|tv|cc|tk|ml|ga|cf|gq)\b)/i;

                if (!linkRegex.test(content)) return;

                await message.delete().catch(() => {});

                let totalWarns = 1;
                if (moderation && typeof moderation.addWarning === "function") {
                    totalWarns = await moderation.addWarning(
                        message.author.id,
                        client.user.id,
                        "Invio di link non autorizzato (Anti-Link Automatico)"
                    );
                }

                const alertMsg = await message.channel.send({
                    content: `⚠️ ${message.author}, è vietato inviare link! Il messaggio è stato rimosso e hai ricevuto un **Warn automatico** (Totale warn: **${totalWarns}**).`
                }).catch(() => {});
                
                setTimeout(() => alertMsg?.delete().catch(() => {}), 6000);

                if (config.logChannel) {
                    const logChannel = message.guild.channels.cache.get(config.logChannel);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle("🛡️ Anti-Link Automatico Intervenuto")
                            .setColor(0xED4245)
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: "👤 Utente Warnato", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
                                { name: "🤖 Eseguito da", value: `${client.user} (Sistema Automatico)`, inline: true },
                                { name: "📌 Canale", value: `${message.channel}`, inline: true },
                                { name: "📝 Contenuto Eliminato", value: `\`\`\`${content.length > 900 ? content.substring(0, 900) + "..." : content}\`\`\`` },
                                { name: "⚠️ Totale Warn Utente", value: `**${totalWarns}**`, inline: true },
                                { name: "⚙️ Azione", value: "Messaggio eliminato & Warn registrato", inline: false }
                            )
                            .setTimestamp();

                        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
                    }
                }
            } catch (error) {
                console.error("🚨 Errore nel listener Anti-Link:", error);
            }
        });
    }
};
