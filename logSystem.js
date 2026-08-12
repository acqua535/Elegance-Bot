const { 
    EmbedBuilder, 
    AuditLogEvent, 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType, 
    REST, 
    Routes 
} = require("discord.js");
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

// Salva la configurazione dei log PRESERVANDO le altre chiavi
const saveSetup = (guildId, channelId, userId) => {
    const setups = getSetups();
    setups[guildId] = {
        ...setups[guildId],
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

    // ====================================================
    // 🛠️ SETUP E REGISTRAZIONE COMANDO SLASH (/setup-logs)
    // ====================================================
    const setupCommand = new SlashCommandBuilder()
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

    // Registra automaticamente il comando slash su Discord
    client.once("ready", async () => {
        try {
            const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: [setupCommand.toJSON()] }
            );
            console.log("Comando /setup-logs registrato con successo!");
        } catch (err) {
            console.error("Errore nella registrazione del comando Slash:", err);
        }
    });

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
                await interaction.reply({ content: "❌ Si è verificato un errore durante il salvataggio.", ephemeral: true });
            }
        }
    });

    // ====================================================
    // 📊 PARTE 1 - UTENTI, MESSAGGI, REAZIONI, VOCALI
    // ====================================================

    // UTENTE ENTRATO
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

    // UTENTE USCITO / KICKATO
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
            } catch (err) {}

            const user = member.user;
            const isKick = Boolean(executor);
            const embed = new EmbedBuilder()
                .setTitle(isKick ? "🦵 Utente Espulso (Kick)" : "📤 Utente Uscito")
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

    // AGGIORNAMENTO MEMBRO
    client.on("guildMemberUpdate", async (oldMember, newMember) => {
        try {
            const logChannel = getLogChannel(newMember?.guild);
            if (!logChannel) return;

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

            if (!oldMember.premiumSince && newMember.premiumSince) {
                const embed = new EmbedBuilder()
                    .setTitle("🚀 Nuovo Server Boost!")
                    .setColor(0xFF73FA)
                    .addFields({ name: "👤 Utente", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true })
                    .setTimestamp();
                return logChannel.send({ embeds: [embed] }).catch(() => {});
            }

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

    // MESSAGGI ELIMINATI
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

    // MESSAGGI MODIFICATI
    client.on("messageUpdate", async (oldMessage, newMessage) => {
        try {
            if (oldMessage.partial) { try { await oldMessage.fetch(); } catch { return; } }
            if (newMessage.partial) { try { await newMessage.fetch(); } catch { return; } }
            if (!oldMessage?.guild || oldMessage.author?.bot) return;
            const logChannel = getLogChannel(oldMessage.guild);
            if (!logChannel) return;

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

    // VOCALI
    client.on("voiceStateUpdate", async (oldState, newState) => {
        try {
            const guild = newState?.guild || oldState?.guild;
            const logChannel = getLogChannel(guild);
            if (!logChannel) return;
            const member = newState?.member || oldState?.member;
            if (!member || member.user.bot) return;

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

    // ====================================================
    // 📊 PARTE 2 - CANALI, RUOLI, BAN
    // ====================================================

    // CANALI
    client.on("channelCreate", async (channel) => {
        try {
            if (!channel.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("📁 Canale Creato")
                .setColor(0x57F287)
                .addFields(
                    { name: "📌 Canale", value: `${channel} (\`${channel.id}\`)`, inline: true },
                    { name: "🏷️ Tipo", value: `\`${channel.type}\``, inline: true }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("channelDelete", async (channel) => {
        try {
            if (!channel.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("🗑️ Canale Eliminato")
                .setColor(0xED4245)
                .addFields(
                    { name: "📌 Nome Canale", value: `#${channel.name} (\`${channel.id}\`)`, inline: true },
                    { name: "🏷️ Tipo", value: `\`${channel.type}\``, inline: true }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // RUOLI
    client.on("roleCreate", async (role) => {
        try {
            const logChannel = getLogChannel(role.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("🛡️ Ruolo Creato")
                .setColor(0x57F287)
                .addFields(
                    { name: "📌 Ruolo", value: `${role} (\`${role.id}\`)`, inline: true },
                    { name: "🎨 Colore", value: `\`${role.hexColor}\``, inline: true }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("roleDelete", async (role) => {
        try {
            const logChannel = getLogChannel(role.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("🗑️ Ruolo Eliminato")
                .setColor(0xED4245)
                .addFields({ name: "📌 Nome Ruolo", value: `@${role.name} (\`${role.id}\`)`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    // BAN & UNBAN
    client.on("guildBanAdd", async (ban) => {
        try {
            const logChannel = getLogChannel(ban.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("🔨 Utente Bannato")
                .setColor(0xED4245)
                .addFields(
                    { name: "👤 Utente", value: `${ban.user.tag} (\`${ban.user.id}\`)`, inline: true },
                    { name: "📝 Motivo", value: ban.reason || "Nessun motivo specificato", inline: false }
                ).setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });

    client.on("guildBanRemove", async (ban) => {
        try {
            const logChannel = getLogChannel(ban.guild);
            if (!logChannel) return;
            const embed = new EmbedBuilder()
                .setTitle("🔓 Utente Sbannato")
                .setColor(0x57F287)
                .addFields({ name: "👤 Utente", value: `${ban.user.tag} (\`${ban.user.id}\`)`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) { console.error(err); }
    });
};
                
