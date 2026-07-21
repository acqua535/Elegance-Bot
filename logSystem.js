const { EmbedBuilder, AuditLogEvent } = require("discord.js");

// 📌 ID DEL CANALE LOG DEL TUO SERVER
const LOG_CHANNEL_ID = "1528576197741772902"; 

module.exports = (client) => {
    const getLogChannel = (guild) => {
        if (!guild || !LOG_CHANNEL_ID) return null;
        return guild.channels.cache.get(LOG_CHANNEL_ID);
    };

    // 📥 1. UTENTE ENTRATO
    client.on("guildMemberAdd", async (member) => {
        try {
            const logChannel = getLogChannel(member?.guild);
            if (!logChannel) return;
            const user = member.user;
            const embed = new EmbedBuilder()
                .setTitle("📥 Utente Entrato")
                .setColor(0x57F287)
                .setThumbnail(user?.displayAvatarURL?.({ dynamic: true }) || null)
                .addFields(
                    { name: "👤 Utente", value: `${user} (\`${user.id}\`)`, inline: true },
                    { name: "📅 Creato il", value: user?.createdTimestamp ? `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` : "*N/D*", inline: true }
                )
                .setFooter({ text: `Membri totali: ${member.guild?.memberCount ?? "N/D"}` })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 📤 2. UTENTE USCITO / KICKATO
    client.on("guildMemberRemove", async (member) => {
        try {
            const logChannel = getLogChannel(member?.guild);
            if (!logChannel) return;
            let executor = null, reason = null;
            try {
                const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick });
                const kickLog = fetchedLogs.entries.first();
                if (kickLog && kickLog.target?.id === member.id && (Date.now() - kickLog.createdTimestamp) < 5000) {
                    executor = kickLog.executor;
                    reason = kickLog.reason;
                }
            } catch {}
            const user = member.user;
            const isKick = Boolean(executor);
            const embed = new EmbedBuilder()
                .setTitle(isKick ? "👢 Utente Espulso (Kick)" : "📤 Utente Uscito")
                .setColor(0xED4245)
                .setThumbnail(user?.displayAvatarURL?.({ dynamic: true }) || null)
                .addFields({ name: "👤 Utente", value: `${user ? `${user.tag} (\`${user.id}\`)` : "Sconosciuto"}`, inline: true });
            if (isKick) {
                embed.addFields(
                    { name: "🛡️ Espulso da", value: `${executor} (\`${executor.id}\`)`, inline: true },
                    { name: "📝 Motivo", value: reason || "Nessuno", inline: false }
                );
            }
            embed.setFooter({ text: `Membri rimasti: ${member.guild?.memberCount ?? "N/D"}` }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // ⚙️ 3. AGGIORNAMENTO MEMBRO (Timeout, Nickname, Ruoli, Boost)
    client.on("guildMemberUpdate", async (oldMember, newMember) => {
        try {
            const logChannel = getLogChannel(newMember?.guild);
            if (!logChannel) return;

            // Nickname
            if (oldMember.nickname !== newMember.nickname) {
                const embed = new EmbedBuilder()
                    .setTitle("✏️ Nickname Modificato")
                    .setColor(0xFEE75C)
                    .addFields(
                        { name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
                        { name: "⬅️ Prima", value: oldMember.nickname || oldMember.user.username, inline: true },
                        { name: "➡️ Dopo", value: newMember.nickname || newMember.user.username, inline: true }
                    ).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }

            // Server Boost
            if (!oldMember.premiumSince && newMember.premiumSince) {
                const embed = new EmbedBuilder()
                    .setTitle("🚀 Nuovo Server Boost!")
                    .setColor(0xFF73FA)
                    .addFields({ name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true })
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }

            // Timeout
            if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
                const isTimedOut = newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp > Date.now();
                const embed = new EmbedBuilder()
                    .setTitle(isTimedOut ? "🔇 Utente In Isolamento (Timeout)" : "🔊 Timeout Rimosso")
                    .setColor(isTimedOut ? 0xED4245 : 0x57F287)
                    .addFields({ name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true });
                if (isTimedOut) embed.addFields({ name: "⏰ Scade il", value: `<t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>`, inline: true });
                embed.setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }

            // Ruoli Aggiunti/Rimossi
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
            if (addedRoles.size > 0) {
                const embed = new EmbedBuilder()
                    .setTitle("🛡️ Ruolo Aggiunto")
                    .setColor(0x57F287)
                    .addFields(
                        { name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
                        { name: "➕ Ruoli", value: addedRoles.map(r => `${r}`).join(", "), inline: true }
                    ).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            if (removedRoles.size > 0) {
                const embed = new EmbedBuilder()
                    .setTitle("🛡️ Ruolo Rimosso")
                    .setColor(0xED4245)
                    .addFields(
                        { name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
                        { name: "➖ Ruoli", value: removedRoles.map(r => `${r}`).join(", "), inline: true }
                    ).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        } catch (err) { console.error(err); }
    });

    // 🗑️ 4. MESSAGGIO ELIMINATO
    client.on("messageDelete", async (message) => {
        try {
            if (message.partial) { try { await message.fetch(); } catch { return; } }
            if (!message?.guild || message.author?.bot) return;
            const logChannel = getLogChannel(message.guild);
            if (!logChannel) return;
            const authorTag = message.author ? `${message.author} (\`${message.author.id}\`)` : "*Sconosciuto*";
            const content = message.content ? (message.content.length > 1000 ? message.content.substring(0, 1000) + "..." : message.content) : "*Nessun testo*";
            const embed = new EmbedBuilder()
                .setTitle("🗑️ Messaggio Eliminato")
                .setColor(0xED4245)
                .addFields(
                    { name: "👤 Autore", value: authorTag, inline: true },
                    { name: "📌 Canale", value: `${message.channel}`, inline: true },
                    { name: "📝 Contenuto", value: content }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🧹 5. MESSAGGI ELIMINATI IN MASSA (Clear)
    client.on("messageDeleteBulk", async (messages) => {
        try {
            const firstMsg = messages.first();
            if (!firstMsg?.guild) return;
            const logChannel = getLogChannel(firstMsg.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("🧹 Messaggi Eliminati in Massa")
                .setColor(0xED4245)
                .addFields(
                    { name: "📌 Canale", value: `${firstMsg.channel}`, inline: true },
                    { name: "📊 Quantità", value: `${messages.size}`, inline: true }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // ✏️ 6. MESSAGGIO MODIFICATO
    client.on("messageUpdate", async (oldMessage, newMessage) => {
        try {
            if (oldMessage.partial) { try { await oldMessage.fetch(); } catch { return; } }
            if (newMessage.partial) { try { await newMessage.fetch(); } catch { return; } }
            if (!oldMessage?.guild || oldMessage.author?.bot || oldMessage.content === newMessage?.content) return;
            const logChannel = getLogChannel(oldMessage.guild);
            if (!logChannel) return;
            const authorTag = oldMessage.author ? `${oldMessage.author} (\`${oldMessage.author.id}\`)` : "*Sconosciuto*";
            const embed = new EmbedBuilder()
                .setTitle("✏️ Messaggio Modificato")
                .setColor(0xFEE75C)
                .addFields(
                    { name: "👤 Autore", value: authorTag, inline: true },
                    { name: "📌 Canale", value: `${oldMessage.channel}`, inline: true },
                    { name: "⬅️ Prima", value: oldMessage.content ? oldMessage.content.substring(0, 500) : "*Vuoto*" },
                    { name: "➡️ Dopo", value: newMessage?.content ? newMessage.content.substring(0, 500) : "*Vuoto*" }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // ⭐ 7. REAZIONI
    client.on("messageReactionAdd", async (reaction, user) => {
        try {
            if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
            if (user.bot || !reaction.message.guild) return;
            const logChannel = getLogChannel(reaction.message.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("⭐ Reazione Aggiunta")
                .setColor(0x57F287)
                .addFields(
                    { name: "👤 Utente", value: `${user} (\`${user.id}\`)`, inline: true },
                    { name: "😀 Emoji", value: `${reaction.emoji}`, inline: true },
                    { name: "📌 Messaggio", value: `[Vai al messaggio](${reaction.message.url})`, inline: true }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🔊 8. CANALI VOCALI
    client.on("voiceStateUpdate", async (oldState, newState) => {
        try {
            const guild = newState?.guild || oldState?.guild;
            const logChannel = getLogChannel(guild);
            if (!logChannel) return;
            const member = newState?.member || oldState?.member;
            if (!member) return;

            if (!oldState.channelId && newState.channelId) {
                const embed = new EmbedBuilder().setTitle("🔊 Connessione Vocale").setColor(0x57F287)
                    .addFields({ name: "👤 Utente", value: `${member.user} (\`${member.id}\`)`, inline: true }, { name: "📌 Canale", value: `<#${newState.channelId}>`, inline: true }).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            if (oldState.channelId && !newState.channelId) {
                const embed = new EmbedBuilder().setTitle("🔇 Disconnessione Vocale").setColor(0xED4245)
                    .addFields({ name: "👤 Utente", value: `${member.user} (\`${member.id}\`)`, inline: true }, { name: "📌 Canale Lasciato", value: `<#${oldState.channelId}>`, inline: true }).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                const embed = new EmbedBuilder().setTitle("🔄 Spostamento Vocale").setColor(0x5865F2)
                    .addFields({ name: "👤 Utente", value: `${member.user} (\`${member.id}\`)`, inline: false }, { name: "⬅️ Da", value: `<#${oldState.channelId}>`, inline: true }, { name: "➡️ A", value: `<#${newState.channelId}>`, inline: true }).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        } catch (err) { console.error(err); }
    });

    // 📁 9. CANALI
    client.on("channelCreate", async (channel) => {
        try {
            if (!channel?.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("📁 Canale Creato").setColor(0x57F287)
                .addFields({ name: "📌 Nome", value: `${channel.name}`, inline: true }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("channelDelete", async (channel) => {
        try {
            if (!channel?.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🗑️ Canale Eliminato").setColor(0xED4245)
                .addFields({ name: "📌 Nome", value: `${channel.name}`, inline: true }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🛡️ 10. RUOLI
    client.on("roleCreate", async (role) => {
        try {
            const logChannel = getLogChannel(role?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("👑 Ruolo Creato").setColor(0x57F287)
                .addFields({ name: "📌 Nome", value: `${role.name} (\`${role.id}\`)`, inline: true }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("roleDelete", async (role) => {
        try {
            const logChannel = getLogChannel(role?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🗑️ Ruolo Eliminato").setColor(0xED4245)
                .addFields({ name: "📌 Nome", value: `${role.name}`, inline: true }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🔨 11. BAN / UNBAN
    client.on("guildBanAdd", async (ban) => {
        try {
            const logChannel = getLogChannel(ban?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🔨 Utente Bannato").setColor(0xED4245)
                .addFields({ name: "👤 Utente", value: `${ban.user?.tag ?? "Sconosciuto"} (\`${ban.user?.id ?? "N/D"}\`)`, inline: true }, { name: "📝 Motivo", value: ban.reason || "Nessun motivo" }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("guildBanRemove", async (ban) => {
        try {
            const logChannel = getLogChannel(ban?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🔓 Utente Sbannato").setColor(0x57F287)
                .addFields({ name: "👤 Utente", value: `${ban.user?.tag ?? "Sconosciuto"} (\`${ban.user?.id ?? "N/D"}\`)`, inline: true }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🔗 12. INVITI
    client.on("inviteCreate", async (invite) => {
        try {
            const logChannel = getLogChannel(invite?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🔗 Invito Creato").setColor(0x57F287)
                .addFields({ name: "🔑 Codice", value: `\`${invite.code}\``, inline: true }, { name: "📌 Canale", value: `${invite.channel}`, inline: true }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🧵 13. THREAD
    client.on("threadCreate", async (thread) => {
        try {
            const logChannel = getLogChannel(thread?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🧵 Thread Creato").setColor(0x57F287)
                .addFields({ name: "📌 Nome", value: `${thread.name}`, inline: true }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });
};
                        
