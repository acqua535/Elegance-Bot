// ==========================================
// FILE: logSystem.js (PARTE 1 DI 2)
// ==========================================
const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} = require("discord.js");

// 🛡️ IMPORT BLINDATO MULTI-PERCORSO
// Risolve qualsiasi problema di maiuscole/minuscole o cartelle sul server Linux
let Setup;
try { Setup = require("./models/setup"); } catch {
    try { Setup = require("./models/Setup"); } catch {
        try { Setup = require("./Models/setup"); } catch {
            try { Setup = require("./Models/Setup"); } catch {
                try { Setup = require("./setup"); } catch {
                    Setup = require("./Setup");
                }
            }
        }
    }
}

const STAFF_ROLE_ID = "1528576014446231683";

// Helper per salvare o aggiornare la configurazione su MongoDB
const saveLogSetup = async (guildId, data) => {
    try {
        const updateData = {};
        if (data.logChannel !== undefined) updateData.logChannel = data.logChannel;
        if (data.enabled !== undefined) updateData.logEnabled = data.enabled;

        return await Setup.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { upsert: true, new: true }
        );
    } catch (e) {
        console.error("[MONGO ERROR] Errore durante il salvataggio dei Log:", e);
        return null;
    }
};

// Ottiene la configurazione salvata da MongoDB per la gilda
const getGuildLogConfig = async (guildId) => {
    if (!guildId) return { logChannel: null, enabled: false };
    try {
        let setup = await Setup.findOne({ guildId });
        if (!setup) {
            setup = await Setup.create({ guildId, logChannel: null, logEnabled: true });
        }
        return {
            logChannel: setup.logChannel || null,
            enabled: setup.logEnabled ?? true
        };
    } catch (e) {
        console.error("[MONGO ERROR] Errore nella lettura della configurazione Log:", e);
        return { logChannel: null, enabled: false };
    }
};

// Funzione helper per inviare gli embed di log
async function sendLog(guild, title, description, color = 0x2b2d31) {
    if (!guild?.id) return;
    const config = await getGuildLogConfig(guild.id);
    if (!config.enabled || !config.logChannel) return;

    const channel = guild.channels?.cache?.get(config.logChannel);
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
        if (!interaction?.member?.roles?.cache?.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = await getGuildLogConfig(interaction.guild?.id);

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

        await interaction.editReply({ embeds: [embed], components: [row] });
    },

    async buttonHandler(interaction) {
        if (!interaction?.member?.roles?.cache?.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non hai i permessi per usare questi pulsanti.",
                flags: MessageFlags.Ephemeral
            });
        }

        const { customId, channel, guild } = interaction;
        if (!guild) return;

        let currentConfig = await getGuildLogConfig(guild.id);

        if (customId === "log_toggle") {
            const newStatus = !currentConfig.enabled;
            await saveLogSetup(guild.id, { enabled: newStatus });
            currentConfig.enabled = newStatus;
        } else if (customId === "log_set_channel") {
            await saveLogSetup(guild.id, { logChannel: channel.id });
            currentConfig.logChannel = channel.id;
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO LOG")
            .setDescription(
                "Stato della configurazione aggiornato e salvato su MongoDB Cloud!\n\n" +
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
    // FILE: logSystem.js (PARTE 2 DI 2)
    // ==========================================
    initEvents(client) {

        // 1. MESSAGGI
        client.on("messageDelete", async (message) => {
            try {
                if (message?.partial) await message.fetch().catch(() => {});
                if (!message?.guild || message.author?.bot) return;

                const content = message.content ? (message.content.length > 1000 ? message.content.substring(0, 1000) + "..." : message.content) : "*Solo allegati o embed*";
                await sendLog(
                    message.guild,
                    "🗑️ Messaggio Eliminato",
                    `**Autore:** ${message.author || "`Sconosciuto`"} (\`${message.author?.id || "N/D"}\`)\n**Canale:** ${message.channel}\n\n**Contenuto:**\n${content}`,
                    0xED4245
                );
            } catch (e) {
                console.error("[LOG ERROR] messageDelete:", e);
            }
        });

        client.on("messageUpdate", async (oldMessage, newMessage) => {
            try {
                if (oldMessage?.partial) await oldMessage.fetch().catch(() => {});
                if (newMessage?.partial) await newMessage.fetch().catch(() => {});
                if (!oldMessage?.guild || oldMessage.author?.bot) return;
                if (oldMessage.content === newMessage.content) return;

                await sendLog(
                    oldMessage.guild,
                    "✏️ Messaggio Modificato",
                    `**Autore:** ${oldMessage.author || "`Sconosciuto`"} (\`${oldMessage.author?.id || "N/D"}\`)\n**Canale:** ${oldMessage.channel}\n\n**Prima:**\n${oldMessage.content || "*Vuoto*"}\n\n**Dopo:**\n${newMessage.content || "*Vuoto*"}`,
                    0xFEE75C
                );
            } catch (e) {
                console.error("[LOG ERROR] messageUpdate:", e);
            }
        });

        // 2. MEMBRI & TIMEOUT
        client.on("guildMemberUpdate", async (oldMember, newMember) => {
            try {
                if (!newMember?.guild) return;

                if (oldMember?.nickname !== newMember?.nickname) {
                    await sendLog(
                        newMember.guild,
                        "✏️ Nickname Modificato",
                        `**Utente:** ${newMember.user} (\`${newMember.id}\`)\n**Prima:** ${oldMember?.nickname || oldMember?.user?.username || "Nessuno"}\n**Dopo:** ${newMember.nickname || newMember.user?.username}`,
                        0x3498DB
                    );
                }

                if (oldMember?.communicationDisabledUntilTimestamp !== newMember?.communicationDisabledUntilTimestamp) {
                    const isTimedOut = newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp > Date.now();
                    await sendLog(
                        newMember.guild,
                        isTimedOut ? "🔇 Utente in Timeout" : "🔊 Timeout Rimosso",
                        `**Utente:** ${newMember.user} (\`${newMember.id}\`)` + (isTimedOut ? `\n**Scade il:** <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>` : ""),
                        isTimedOut ? 0xED4245 : 0x57F287
                    );
                }

                if (oldMember?.roles?.cache && newMember?.roles?.cache) {
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
                }
            } catch (e) {
                console.error("[LOG ERROR] guildMemberUpdate:", e);
            }
        });

        // 3. CANALI VOCALI
        client.on("voiceStateUpdate", async (oldState, newState) => {
            try {
                const member = newState?.member || oldState?.member;
                if (!member || member.user?.bot) return;

                const guild = newState?.guild || oldState?.guild;
                if (!guild) return;

                if (!oldState?.channelId && newState?.channelId) {
                    await sendLog(
                        guild,
                        "🔊 Connessione Vocale",
                        `**Utente:** ${member.user} (\`${member.id}\`)\n**Canale:** <#${newState.channelId}>`,
                        0x57F287
                    );
                } else if (oldState?.channelId && !newState?.channelId) {
                    await sendLog(
                        guild,
                        "🔇 Disconnessione Vocale",
                        `**Utente:** ${member.user} (\`${member.id}\`)\n**Canale:** <#${oldState.channelId}>`,
                        0xED4245
                    );
                } else if (oldState?.channelId && newState?.channelId && oldState.channelId !== newState.channelId) {
                    await sendLog(
                        guild,
                        "🔄 Spostamento Vocale",
                        `**Utente:** ${member.user}\n**Da:** <#${oldState.channelId}>\n**A:** <#${newState.channelId}>`,
                        0x3498DB
                    );
                }
            } catch (e) {
                console.error("[LOG ERROR] voiceStateUpdate:", e);
            }
        });

        // 4. CANALI SERVER
        client.on("channelCreate", async (channel) => {
            try {
                if (!channel?.guild) return;
                await sendLog(
                    channel.guild,
                    "📁 Canale Creato",
                    `**Nome:** ${channel} (\`${channel.id}\`)\n**Tipo:** \`${channel.type}\``,
                    0x57F287
                );
            } catch (e) {
                console.error("[LOG ERROR] channelCreate:", e);
            }
        });

        client.on("channelDelete", async (channel) => {
            try {
                if (!channel?.guild) return;
                await sendLog(
                    channel.guild,
                    "🗑️ Canale Eliminato",
                    `**Nome:** #${channel.name || "canale-sconosciuto"} (\`${channel.id}\`)`,
                    0xED4245
                );
            } catch (e) {
                console.error("[LOG ERROR] channelDelete:", e);
            }
        });

        // 5. BAN E UNBAN
        client.on("guildBanAdd", async (ban) => {
            try {
                if (!ban?.guild) return;
                const userTag = ban.user ? `${ban.user.username}` : "Utente Sconosciuto";
                const userId = ban.user?.id || "N/D";

                await sendLog(
                    ban.guild,
                    "🔨 Utente Bannato",
                    `**Utente:** ${userTag} (\`${userId}\`)\n**Motivo:** ${ban.reason || "Nessuno"}`,
                    0xED4245
                );
            } catch (e) {
                console.error("[LOG ERROR] guildBanAdd:", e);
            }
        });

        client.on("guildBanRemove", async (ban) => {
            try {
                if (!ban?.guild) return;
                const userTag = ban.user ? `${ban.user.username}` : "Utente Sconosciuto";
                const userId = ban.user?.id || "N/D";

                await sendLog(
                    ban.guild,
                    "🔓 Utente Sbannato",
                    `**Utente:** ${userTag} (\`${userId}\`)`,
                    0x57F287
                );
            } catch (e) {
                console.error("[LOG ERROR] guildBanRemove:", e);
            }
        });
    }
};
            
