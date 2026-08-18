// ==========================================
// FILE: logSystem.js (VERSIONE COMPLETA E INTEGRATA)
// ==========================================
const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const STAFF_ROLE_ID = "1528576014446231683";
const SETUPS_PATH = path.join(__dirname, "setups.json");

// Helper per leggere dal file setups.json
const getSetups = () => {
    if (!fs.existsSync(SETUPS_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(SETUPS_PATH, "utf8"));
    } catch {
        return {};
    }
};

// Helper per salvare la configurazione su setups.json preservando gli altri moduli
const saveLogSetup = (guildId, data) => {
    const setups = getSetups();
    setups[guildId] = {
        ...setups[guildId],
        logChannel: data.logChannel !== undefined ? data.logChannel : (setups[guildId]?.logChannel || null),
        logEnabled: data.enabled !== undefined ? data.enabled : (setups[guildId]?.logEnabled ?? true)
    };
    fs.writeFileSync(SETUPS_PATH, JSON.stringify(setups, null, 4));
};

// Ottiene la configurazione salvata per la gilda
const getGuildLogConfig = (guildId) => {
    const setups = getSetups();
    return {
        logChannel: setups[guildId]?.logChannel || null,
        enabled: setups[guildId]?.logEnabled ?? true
    };
};

// Funzione helper per inviare gli embed di log
async function sendLog(guild, title, description, color = 0x2b2d31) {
    if (!guild) return;
    const config = getGuildLogConfig(guild.id);
    if (!config.enabled || !config.logChannel) return;

    const channel = guild.channels.cache.get(config.logChannel);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: "Elegance Sponsoring • Log System" })
        .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("log-setup")
        .setDescription("Gestisci e configura il sistema dei Log di Elegance Sponsoring"),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        const config = getGuildLogConfig(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO LOG")
            .setDescription(
                "Da questo pannello puoi gestire il sistema dei **Log Avanzati** del server.\n\n" +
                `📌 **Canale Log:** ${config.logChannel ? `<#${config.logChannel}>` : "`Non impostato (Usa il pulsante sotto)`"}\n\n` +
                `• **Stato Sistema Log:** ${config.enabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • System Control" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("log_toggle")
                .setLabel(config.enabled ? "Disattiva Log" : "Attiva Log")
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("log_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    },

    async buttonHandler(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non hai i permessi per usare questi pulsanti.",
                flags: MessageFlags.Ephemeral
            });
        }

        const { customId, channel, guild } = interaction;
        let currentConfig = getGuildLogConfig(guild.id);

        if (customId === "log_toggle") {
            const newStatus = !currentConfig.enabled;
            saveLogSetup(guild.id, { enabled: newStatus });
            currentConfig.enabled = newStatus;
        } else if (customId === "log_set_channel") {
            saveLogSetup(guild.id, { logChannel: channel.id });
            currentConfig.logChannel = channel.id;
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO LOG")
            .setDescription(
                "Stato della configurazione aggiornato e salvato nel database!\n\n" +
                `📌 **Canale Log Impostato:** ${currentConfig.logChannel ? `<#${currentConfig.logChannel}>` : "`Non impostato`"}\n\n` +
                `• **Stato Sistema Log:** ${currentConfig.enabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • System Control" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("log_toggle")
                .setLabel(currentConfig.enabled ? "Disattiva Log" : "Attiva Log")
                .setStyle(currentConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("log_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ embeds: [embed], components: [row] });
    },

    // ==========================================
    // INIZIALIZZAZIONE DEGLI EVENTI LOG
    // ==========================================
    initEvents(client) {

        // 1. MESSAGGI
        client.on("messageDelete", async (message) => {
            if (message.partial) { try { await message.fetch(); } catch { return; } }
            if (!message?.guild || message.author?.bot) return;

            const content = message.content ? (message.content.length > 1000 ? message.content.substring(0, 1000) + "..." : message.content) : "*Solo allegati o embed*";
            await sendLog(
                message.guild,
                "🗑️ Messaggio Eliminato",
                `**Autore:** ${message.author} (\`${message.author.id}\`)\n**Canale:** ${message.channel}\n\n**Contenuto:**\n${content}`,
                0xED4245
            );
        });

        client.on("messageUpdate", async (oldMessage, newMessage) => {
            if (oldMessage.partial) { try { await oldMessage.fetch(); } catch { return; } }
            if (newMessage.partial) { try { await newMessage.fetch(); } catch { return; } }
            if (!oldMessage?.guild || oldMessage.author?.bot) return;
            if (oldMessage.content === newMessage.content) return;

            await sendLog(
                oldMessage.guild,
                "✏️ Messaggio Modificato",
                `**Autore:** ${oldMessage.author} (\`${oldMessage.author.id}\`)\n**Canale:** ${oldMessage.channel}\n\n**Prima:**\n${oldMessage.content || "*Vuoto*"}\n\n**Dopo:**\n${newMessage.content || "*Vuoto*"}`,
                0xFEE75C
            );
        });

        // 2. MEMBRI & TIMEOUT
        client.on("guildMemberUpdate", async (oldMember, newMember) => {
            if (!newMember.guild) return;

            if (oldMember.nickname !== newMember.nickname) {
                await sendLog(
                    newMember.guild,
                    "✏️ Nickname Modificato",
                    `**Utente:** ${newMember.user} (\`${newMember.id}\`)\n**Prima:** ${oldMember.nickname || oldMember.user.username}\n**Dopo:** ${newMember.nickname || newMember.user.username}`,
                    0x3498DB
                );
            }

            if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
                const isTimedOut = newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp > Date.now();
                await sendLog(
                    newMember.guild,
                    isTimedOut ? "🔇 Utente in Timeout" : "🔊 Timeout Rimosso",
                    `**Utente:** ${newMember.user} (\`${newMember.id}\`)` + (isTimedOut ? `\n**Scade il:** <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>` : ""),
                    isTimedOut ? 0xED4245 : 0x57F287
                );
            }

            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

            if (addedRoles.size > 0) {
                await sendLog(
                    newMember.guild,
                    "🛡️ Ruolo Assegnato",
                    `**Utente:** ${newMember.user}\n**Ruoli Aggiunti:** ${addedRoles.map(r => `${r}`).join(", ")}`,
                    0x57F287
                );
            }
            if (removedRoles.size > 0) {
                await sendLog(
                    newMember.guild,
                    "🛡️ Ruolo Rimosso",
                    `**Utente:** ${newMember.user}\n**Ruoli Rimossi:** ${removedRoles.map(r => `${r}`).join(", ")}`,
                    0xED4245
                );
            }
        });

        // 3. CANALI VOCALI
        client.on("voiceStateUpdate", async (oldState, newState) => {
            const member = newState.member || oldState.member;
            if (!member || member.user.bot) return;

            if (!oldState.channelId && newState.channelId) {
                await sendLog(
                    newState.guild,
                    "🔊 Connessione Vocale",
                    `**Utente:** ${member.user} (\`${member.id}\`)\n**Canale:** <#${newState.channelId}>`,
                    0x57F287
                );
            } else if (oldState.channelId && !newState.channelId) {
                await sendLog(
                    oldState.guild,
                    "🔇 Disconnessione Vocale",
                    `**Utente:** ${member.user} (\`${member.id}\`)\n**Canale:** <#${oldState.channelId}>`,
                    0xED4245
                );
            } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                await sendLog(
                    newState.guild,
                    "🔄 Spostamento Vocale",
                    `**Utente:** ${member.user}\n**Da:** <#${oldState.channelId}>\n**A:** <#${newState.channelId}>`,
                    0x3498DB
                );
            }
        });

        // 4. CANALI SERVER
        client.on("channelCreate", async (channel) => {
            if (!channel.guild) return;
            await sendLog(
                channel.guild,
                "📁 Canale Creato",
                `**Nome:** ${channel} (\`${channel.id}\`)\n**Tipo:** \`${channel.type}\``,
                0x57F287
            );
        });

        client.on("channelDelete", async (channel) => {
            if (!channel.guild) return;
            await sendLog(
                channel.guild,
                "🗑️ Canale Eliminato",
                `**Nome:** #${channel.name} (\`${channel.id}\`)`,
                0xED4245
            );
        });

        // 5. BAN E UNBAN
        client.on("guildBanAdd", async (ban) => {
            await sendLog(
                ban.guild,
                "🔨 Utente Bannato",
                `**Utente:** ${ban.user.tag} (\`${ban.user.id}\`)\n**Motivo:** ${ban.reason || "Nessuno"}`,
                0xED4245
            );
        });

        client.on("guildBanRemove", async (ban) => {
            await sendLog(
                ban.guild,
                "🔓 Utente Sbannato",
                `**Utente:** ${ban.user.tag} (\`${ban.user.id}\`)`,
                0x57F287
            );
        });
    }
};
                                              
