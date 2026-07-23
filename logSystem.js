const { EmbedBuilder, AuditLogEvent, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");

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

// Salva la configurazione dei log PRESERVANDO entry, apply, invites e gli altri setup
const saveSetup = (guildId, channelId, userId) => {
    const setups = getSetups();
    
    setups[guildId] = {
        ...setups[guildId], // 👈 Mantiene intatti entry, apply, invites e qualsiasi altro setup salvato!
        logChannelId: channelId,
        logConfiguredBy: userId,
        logUpdatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(SETUPS_PATH, JSON.stringify(setups, null, 4));
};

const getLogChannelId = (guildId) => {
    const setups = getSetups();
    return setups[guildId]?.logChannelId || null;
};

module.exports = (client) => {
    const getLogChannel = (guild) => {
        if (!guild) return null;
        const channelId = getLogChannelId(guild.id);
        if (!channelId) return null;
        return guild.channels.cache.get(channelId);
    };

    // ----------------------------------------------------
    // 🛠️ DEFINIZIONE E GESTIONE COMANDO DI SETUP (/setup-logs)
    // ----------------------------------------------------
    client.logSetupCommandData = new SlashCommandBuilder()
        .setName("setup-logs")
        .setDescription("Configura il canale unico in cui inviare TUTTI i log del server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("canale")
                .setDescription("Seleziona il canale dove inviare i log")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        );

    // Gestore dell'interazione per il comando
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === "setup-logs") {
            const channel = interaction.options.getChannel("canale");
            
            try {
                saveSetup(interaction.guild.id, channel.id, interaction.user.id);

                const embed = new EmbedBuilder()
                    .setTitle("✅ Setup Log Completato!")
                    .setColor(0x57F287)
                    .setDescription(`Tutti i log avanzati del server verranno ora inviati nel canale ${channel}!`)
                    .addFields(
                        { name: "📌 Canale Log", value: `${channel} (\`${channel.id}\`)`, inline: true },
                        { name: "🛡️ Configurato da", value: `${interaction.user}`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: "❌ Si è verificato un errore durante il salvataggio nel file di setup.", ephemeral: true });
            }
        }
    });

    // ----------------------------------------------------
    // 📊 EVENTI DI LOGGING - PARTE 1
    // ----------------------------------------------------

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

    // ⚙️ 3. AGGIORNAMENTO MEMBRO (Timeout, Nickname, Ruoli, Boost, Avatar Server)
    client.on("guildMemberUpdate", async (oldMember, newMember) => {
        try {
            const logChannel = getLogChannel(newMember?.guild);
            if (!logChannel) return;

            // Nickname Modificato
            if (oldMember.nickname !== newMember.nickname) {
                const embed = new EmbedBuilder()
                    .setTitle("✏️ Nickname Server Modificato")
                    .setColor(0xFEE75C)
                    .addFields(
                        { name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
                        { name: "⬅️ Prima", value: oldMember.nickname || oldMember.user.username, inline: true },
                        { name: "➡️ Dopo", value: newMember.nickname || newMember.user.username, inline: true }
                    ).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }

            // Avatar Server Modificato
            if (oldMember.avatar !== newMember.avatar) {
                const embed = new EmbedBuilder()
                    .setTitle("🎭 Avatar Server Modificato")
                    .setColor(0x5865F2)
                    .setThumbnail(newMember.avatarURL({ dynamic: true }))
                    .addFields({ name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true })
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }

            // Boost
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

            // Ruoli Assegnati / Rimossi
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
            if (addedRoles.size > 0) {
                const embed = new EmbedBuilder()
                    .setTitle("🛡️ Ruolo Aggiunto ad Utente")
                    .setColor(0x57F287)
                    .addFields(
                        { name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
                        { name: "➕ Ruoli", value: addedRoles.map(r => `${r}`).join(", "), inline: true }
                    ).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            if (removedRoles.size > 0) {
                const embed = new EmbedBuilder()
                    .setTitle("🛡️ Ruolo Rimosso da Utente")
                    .setColor(0xED4245)
                    .addFields(
                        { name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
                        { name: "➖ Ruoli", value: removedRoles.map(r => `${r}`).join(", "), inline: true }
                    ).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        } catch (err) { console.error(err); }
    });

    // 🗑️ 4. MESSAGGI ELIMINATI & BULK DELETE
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

    client.on("messageDeleteBulk", async (messages) => {
        try {
            const firstMsg = messages.first();
            if (!firstMsg?.guild) return;
            const logChannel = getLogChannel(firstMsg.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("🧹 Messaggi Eliminati in Massa (Bulk Delete)")
                .setColor(0xED4245)
                .addFields(
                    { name: "📌 Canale", value: `${firstMsg.channel}`, inline: true },
                    { name: "📊 Quantità Messaggi", value: `\`${messages.size}\``, inline: true }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // ✏️ 5. MESSAGGIO MODIFICATO E MESSAGGI FISSATI
    client.on("messageUpdate", async (oldMessage, newMessage) => {
        try {
            if (oldMessage.partial) { try { await oldMessage.fetch(); } catch { return; } }
            if (newMessage.partial) { try { await newMessage.fetch(); } catch { return; } }
            if (!oldMessage?.guild || oldMessage.author?.bot) return;
            
            const logChannel = getLogChannel(oldMessage.guild);
            if (!logChannel) return;

            // Fissato / Sfissato
            if (oldMessage.pinned !== newMessage.pinned) {
                const embed = new EmbedBuilder()
                    .setTitle(newMessage.pinned ? "📌 Messaggio Fissato" : "📍 Messaggio Rimosso dai Fissati")
                    .setColor(0x5865F2)
                    .addFields(
                        { name: "📌 Canale", value: `${newMessage.channel}`, inline: true },
                        { name: "🔗 Messaggio", value: `[Vai al messaggio](${newMessage.url})`, inline: true }
                    ).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }

            // Modifica Testo
            if (oldMessage.content !== newMessage.content) {
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
            }
        } catch (err) { console.error(err); }
    });

    // ⭐ 6. REAZIONI, SUPER REAZIONI & SONDAGGI
    client.on("messageReactionAdd", async (reaction, user) => {
        try {
            if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
            if (user.bot || !reaction.message.guild) return;
            const logChannel = getLogChannel(reaction.message.guild);
            if (!logChannel) return;
            
            const isBurst = reaction.isBurst || false;
            const embed = new EmbedBuilder()
                .setTitle(isBurst ? "💥 Super Reazione Nitro Aggiunta" : "⭐ Reazione Aggiunta")
                .setColor(isBurst ? 0xFF73FA : 0x57F287)
                .addFields(
                    { name: "👤 Utente", value: `${user} (\`${user.id}\`)`, inline: true },
                    { name: "😀 Emoji", value: `${reaction.emoji}`, inline: true },
                    { name: "📌 Messaggio", value: `[Vai al messaggio](${reaction.message.url})`, inline: true }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("messageReactionRemove", async (reaction, user) => {
        try {
            if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
            if (user.bot || !reaction.message.guild) return;
            const logChannel = getLogChannel(reaction.message.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("❌ Reazione Rimosso")
                .setColor(0xED4245)
                .addFields(
                    { name: "👤 Utente", value: `${user} (\`${user.id}\`)`, inline: true },
                    { name: "😀 Emoji", value: `${reaction.emoji}`, inline: true }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("messagePollVoteAdd", async (pollAnswer, userId) => {
        try {
            const guild = pollAnswer.poll.message.guild;
            const logChannel = getLogChannel(guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("📊 Voto Sondaggio Aggiunto").setColor(0x57F287)
                .addFields({ name: "👤 Utente", value: `<@${userId}>`, inline: true }, { name: "📌 Risposta", value: `${pollAnswer.text}`, inline: true }).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🔊 7. VOCALI, STREAMING, STATUS VOCALE & ATTIVITÀ
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
            if (!oldState.streaming && newState.streaming) {
                const embed = new EmbedBuilder().setTitle("📹 Streaming Avviato").setColor(0x57F287)
                    .addFields({ name: "👤 Utente", value: `${member.user}`, inline: true }, { name: "📌 Canale", value: `<#${newState.channelId}>`, inline: true }).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            if (!oldState.selfVideo && newState.selfVideo) {
                const embed = new EmbedBuilder().setTitle("📷 Videocamera Accesa").setColor(0x57F287)
                    .addFields({ name: "👤 Utente", value: `${member.user}`, inline: true }, { name: "📌 Canale", value: `<#${newState.channelId}>`, inline: true }).setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }

            // 📁 8. CANALI, RUOLI, BAN & INVITI
    client.on("channelCreate", async (channel) => {
        try {
            if (!channel?.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("📁 Canale Creato").setColor(0x57F287)
                .addFields({ name: "📌 Nome", value: `${channel.name} (\`${channel.id}\`)`, inline: true }, { name: "📂 Tipo", value: `\`${channel.type}\``, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("channelDelete", async (channel) => {
        try {
            if (!channel?.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🗑️ Canale Eliminato").setColor(0xED4245)
                .addFields({ name: "📌 Nome", value: `${channel.name}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("channelUpdate", async (oldChannel, newChannel) => {
        try {
            if (!newChannel?.guild) return;
            const logChannel = getLogChannel(newChannel.guild);
            if (!logChannel) return;

            if (oldChannel.name !== newChannel.name) {
                const embed = new EmbedBuilder().setTitle("✏️ Nome Canale Modificato").setColor(0xFEE75C)
                    .addFields({ name: "📌 Canale", value: `${newChannel}`, inline: true }, { name: "⬅️ Prima", value: oldChannel.name, inline: true }, { name: "➡️ Dopo", value: newChannel.name, inline: true })
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            if (oldChannel.topic !== newChannel.topic) {
                const embed = new EmbedBuilder().setTitle("📝 Argomento (Topic) Canale Modificato").setColor(0xFEE75C)
                    .addFields({ name: "📌 Canale", value: `${newChannel}`, inline: true }, { name: "⬅️ Prima", value: oldChannel.topic || "*Nessuno*", inline: false }, { name: "➡️ Dopo", value: newChannel.topic || "*Nessuno*", inline: false })
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        } catch (err) { console.error(err); }
    });

    client.on("roleCreate", async (role) => {
        try {
            const logChannel = getLogChannel(role?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("👑 Ruolo Creato").setColor(0x57F287)
                .addFields({ name: "📌 Nome Ruolo", value: `${role.name} (\`${role.id}\`)`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("roleDelete", async (role) => {
        try {
            const logChannel = getLogChannel(role?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🗑️ Ruolo Eliminato").setColor(0xED4245)
                .addFields({ name: "📌 Nome Ruolo", value: `${role.name}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("roleUpdate", async (oldRole, newRole) => {
        try {
            const logChannel = getLogChannel(newRole?.guild);
            if (!logChannel) return;

            if (oldRole.name !== newRole.name) {
                const embed = new EmbedBuilder().setTitle("✏️ Ruolo Rinominato").setColor(0xFEE75C)
                    .addFields({ name: "📌 Ruolo", value: `${newRole}`, inline: true }, { name: "⬅️ Prima", value: oldRole.name, inline: true }, { name: "➡️ Dopo", value: newRole.name, inline: true })
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            if (oldRole.color !== newRole.color) {
                const embed = new EmbedBuilder().setTitle("🎨 Colore Ruolo Modificato").setColor(0x5865F2)
                    .addFields({ name: "📌 Ruolo", value: `${newRole}`, inline: true }, { name: "🎨 Nuovo HEX", value: `\`#${newRole.color.toString(16).padStart(6, '0')}\``, inline: true })
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        } catch (err) { console.error(err); }
    });

    client.on("guildBanAdd", async (ban) => {
        try {
            const logChannel = getLogChannel(ban?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🔨 Utente Bannato").setColor(0xED4245)
                .addFields(
                    { name: "👤 Utente", value: `${ban.user?.tag ?? "Sconosciuto"} (\`${ban.user?.id ?? "N/D"}\`)`, inline: true },
                    { name: "📝 Motivo", value: ban.reason || "Nessun motivo specificato", inline: false }
                )
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("guildBanRemove", async (ban) => {
        try {
            const logChannel = getLogChannel(ban?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🔓 Utente Sbannato").setColor(0x57F287)
                .addFields({ name: "👤 Utente", value: `${ban.user?.tag ?? "Sconosciuto"} (\`${ban.user?.id ?? "N/D"}\`)`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🔗 9. INVITI (Creazione ed Eliminazione)
    client.on("inviteCreate", async (invite) => {
        try {
            const logChannel = getLogChannel(invite?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🔗 Invito Creato").setColor(0x57F287)
                .addFields(
                    { name: "🎟️ Codice", value: `\`${invite.code}\``, inline: true },
                    { name: "👤 Creato da", value: `${invite.inviter || "Sconosciuto"}`, inline: true },
                    { name: "📌 Canale", value: `${invite.channel}`, inline: true }
                )
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("inviteDelete", async (invite) => {
        try {
            const logChannel = getLogChannel(invite?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🗑️ Invito Eliminato/Scaduto").setColor(0xED4245)
                .addFields({ name: "🎟️ Codice", value: `\`${invite.code}\``, inline: true }, { name: "📌 Canale", value: `${invite.channel}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 😀 10. EMOJI E STICKER
    client.on("emojiCreate", async (emoji) => {
        try {
            const logChannel = getLogChannel(emoji?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("😀 Emoji Aggiunta").setColor(0x57F287)
                .addFields({ name: "📌 Nome", value: `${emoji.name} (${emoji})`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("emojiDelete", async (emoji) => {
        try {
            const logChannel = getLogChannel(emoji?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🗑️ Emoji Rimossa").setColor(0xED4245)
                .addFields({ name: "📌 Nome", value: `${emoji.name}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("stickerCreate", async (sticker) => {
        try {
            const logChannel = getLogChannel(sticker?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🖼️ Sticker Aggiunto").setColor(0x57F287)
                .addFields({ name: "📌 Nome", value: `${sticker.name}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("stickerDelete", async (sticker) => {
        try {
            const logChannel = getLogChannel(sticker?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🗑️ Sticker Rimosso").setColor(0xED4245)
                .addFields({ name: "📌 Nome", value: `${sticker.name}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🤖 11. AUTOMOD & WEBHOOKS & THREADS
    client.on("autoModActionExecution", async (execution) => {
        try {
            const logChannel = getLogChannel(execution?.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🛑 AutoMod Intervenuto").setColor(0xED4245)
                .addFields(
                    { name: "👤 Utente Coinvolto", value: `<@${execution.userId}>`, inline: true },
                    { name: "📌 Azione Bloccata", value: `\`${execution.action.type}\``, inline: true },
                    { name: "📝 Parola/Regola Trigger", value: `\`${execution.matchedKeyword || "Regola automatica"}\``, inline: false }
                )
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("threadCreate", async (thread) => {
        try {
            if (!thread?.guild) return;
            const logChannel = getLogChannel(thread.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🧵 Discussione (Thread) Creata").setColor(0x57F287)
                .addFields({ name: "📌 Nome Thread", value: `${thread.name} (<#${thread.id}>)`, inline: true }, { name: "📂 Canale Padre", value: `${thread.parent || "N/D"}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("webhookUpdate", async (channel) => {
        try {
            if (!channel?.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder().setTitle("🔗 Webhook Aggiornato").setColor(0xFEE75C)
                .addFields({ name: "📌 Canale", value: `${channel}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // 🏛️ 12. RESTYLE SERVER (Nome, Icona, Banner)
    client.on("guildUpdate", async (oldGuild, newGuild) => {
        try {
            const logChannel = getLogChannel(newGuild);
            if (!logChannel) return;

            if (oldGuild.name !== newGuild.name) {
                const embed = new EmbedBuilder().setTitle("✏️ Nome del Server Modificato").setColor(0xFEE75C)
                    .addFields({ name: "⬅️ Prima", value: oldGuild.name, inline: true }, { name: "➡️ Dopo", value: newGuild.name, inline: true })
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            if (oldGuild.icon !== newGuild.icon) {
                const embed = new EmbedBuilder().setTitle("🖼️ Icona del Server Modificata").setColor(0x5865F2)
                    .setThumbnail(newGuild.iconURL({ dynamic: true }))
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        } catch (err) { console.error(err); }
    });
};
        
