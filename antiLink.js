const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
const moderation = require("./moderationSystem");

const STAFF_ROLE_ID = "1528576014446231683";
const ALLOWED_ROLE_ID = "1528576014446231683";
const SETUPS_PATH = path.join(__dirname, "setups.json");

const ALLOWED_CHANNELS = [
    "1528576184785305600",
    "1528576181295906826",
    "1528576179177787642"
];

// Legge il file setups.json
const getSetups = () => {
    if (!fs.existsSync(SETUPS_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(SETUPS_PATH, "utf8"));
    } catch {
        return {};
    }
};

// Salva la configurazione dell'anti-link
const saveAntiLinkSetup = (guildId, data) => {
    const setups = getSetups();
    setups[guildId] = {
        ...setups[guildId],
        antiLinkEnabled: data.enabled !== undefined ? data.enabled : (setups[guildId]?.antiLinkEnabled ?? false),
        antiLinkLogChannel: data.logChannel !== undefined ? data.logChannel : (setups[guildId]?.antiLinkLogChannel || null)
    };
    fs.writeFileSync(SETUPS_PATH, JSON.stringify(setups, null, 4));
};

const getGuildConfig = (guildId) => {
    const setups = getSetups();
    return {
        enabled: setups[guildId]?.antiLinkEnabled ?? false,
        logChannel: setups[guildId]?.antiLinkLogChannel || null
    };
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-antilink")
        .setDescription("Gestisci il sistema Anti-Link e imposta il canale di log"),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per eseguire questo comando.",
                flags: MessageFlags.Ephemeral
            });
        }

        const config = getGuildConfig(interaction.guild.id);

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

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    },

    async buttonHandler(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi i permessi per usare questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        const { customId, channel, guild } = interaction;
        let config = getGuildConfig(guild.id);

        if (customId === "antilink_toggle") {
            config.enabled = !config.enabled;
            saveAntiLinkSetup(guild.id, { enabled: config.enabled });
        } else if (customId === "antilink_set_channel") {
            config.logChannel = channel.id;
            saveAntiLinkSetup(guild.id, { logChannel: channel.id });
        }

        const embed = new EmbedBuilder()
            .setTitle("🛡️ ELEGANCE SPONSORING ── PANNELLO ANTI-LINK")
            .setDescription(
                "Impostazioni salvate con successo in `setups.json`!\n\n" +
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

                const config = getGuildConfig(message.guild.id);
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
                    totalWarns = moderation.addWarning(
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
            
