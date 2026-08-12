const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildScheduledEvents
    ]
});

const LOG_CHANNEL_ID = '1528576197741772902';

async function sendLog(guild, title, description, color = 0x2b2d31) {
    const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => {});
}

client.once('ready', () => {
    console.log(`Bot online come ${client.user.tag}`);
});

// ==========================================
// 1. LOG MESSAGGI
// ==========================================

// Messaggio Cancellato
client.on('messageDelete', async (message) => {
    if (!message.guild || message.author?.bot) return;

    const content = message.content || 'Nessun testo (solo allegati o embed)';
    sendLog(
        message.guild,
        '🗑️ Messaggio Eliminato',
        `**Autore:** ${message.author.tag} (${message.author.id})\n**Canale:** <#${message.channel.id}>\n**Contenuto:** ${content}`,
        0xff4d4d
    );
});

// Messaggio Modificato
client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!oldMessage.guild || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    sendLog(
        oldMessage.guild,
        '✏️ Messaggio Modificato',
        `**Autore:** ${oldMessage.author.tag}\n**Canale:** <#${oldMessage.channel.id}>\n\n**Prima:** ${oldMessage.content || 'Vuoto'}\n**Dopo:** ${newMessage.content || 'Vuoto'}`,
        0xffcc00
    );
});

// Messaggi Eliminati in Massa (Purge)
client.on('messageDeleteBulk', async (messages) => {
    const firstMsg = messages.first();
    if (!firstMsg || !firstMsg.guild) return;

    sendLog(
        firstMsg.guild,
        '🧹 Eliminazione di Massa',
        `Sono stati eliminati **${messages.size}** messaggi nel canale <#${firstMsg.channel.id}>.`,
        0xff4d4d
    );
});

// ==========================================
// 2. LOG CANALI
// ==========================================

// Canale Creato
client.on('channelCreate', async (channel) => {
    if (!channel.guild) return;
    sendLog(
        channel.guild,
        '➕ Canale Creato',
        `**Nome:** ${channel.name}\n**Tipo:** ${channel.type}\n**ID:** ${channel.id}`,
        0x2ecc71
    );
});

// Canale Eliminato
client.on('channelDelete', async (channel) => {
    if (!channel.guild) return;
    sendLog(
        channel.guild,
        '➖ Canale Eliminato',
        `**Nome:** ${channel.name}\n**ID:** ${channel.id}`,
        0xe74c3c
    );
});

// Canale Modificato
client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (!oldChannel.guild) return;
    if (oldChannel.name !== newChannel.name) {
        sendLog(
            oldChannel.guild,
            '📝 Nome Canale Modificato',
            `**Prima:** ${oldChannel.name}\n**Dopo:** ${newChannel.name}\n**Canale:** <#${newChannel.id}>`,
            0x3498db
        );
    }
});

// ==========================================
// 3. LOG RUOLI
// ==========================================

// Ruolo Creato
client.on('roleCreate', async (role) => {
    sendLog(
        role.guild,
        '🛡️ Ruolo Creato',
        `**Nome:** ${role.name}\n**ID:** ${role.id}`,
        0x2ecc71
    );
});

// Ruolo Eliminato
client.on('roleDelete', async (role) => {
    sendLog(
        role.guild,
        '🗑️ Ruolo Eliminato',
        `**Nome:** ${role.name}\n**ID:** ${role.id}`,
        0xe74c3c
    );
});

// Ruolo Modificato
client.on('roleUpdate', async (oldRole, newRole) => {
    if (oldRole.name !== newRole.name) {
        sendLog(
            oldRole.guild,
            '✏️ Nome Ruolo Modificato',
            `**Prima:** ${oldRole.name}\n**Dopo:** ${newRole.name}`,
            0x3498db
        );
    }
});

client.login('IL_TUO_TOKEN_HERE');

// ==========================================
// 4. LOG MEMBRI (JOIN / LEAVE / RUOLI)
// ==========================================

// Entrata Membro
client.on('guildMemberAdd', async (member) => {
    sendLog(
        member.guild,
        '📥 Membro Entrato',
        `**Utente:** ${member.user.tag} (<@${member.id}>)\n**ID:** ${member.id}\n**Account Creato:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        0x2ecc71
    );
});

// Uscita Membro
client.on('guildMemberRemove', async (member) => {
    sendLog(
        member.guild,
        '📤 Membro Uscito',
        `**Utente:** ${member.user.tag} (<@${member.id}>)\n**ID:** ${member.id}`,
        0xe74c3c
    );
});

// Aggiornamento Membro (Nickname e Ruoli)
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    // Cambio Nickname
    if (oldMember.nickname !== newMember.nickname) {
        sendLog(
            newMember.guild,
            '✏️ Nickname Modificato',
            `**Utente:** ${newMember.user.tag}\n**Prima:** ${oldMember.nickname || oldMember.user.username}\n**Dopo:** ${newMember.nickname || newMember.user.username}`,
            0x3498db
        );
    }

    // Aggiunta Ruolo
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    if (addedRoles.size > 0) {
        addedRoles.forEach(role => {
            sendLog(
                newMember.guild,
                '➕ Ruolo Assegnato',
                `**Utente:** ${newMember.user.tag}\n**Ruolo:** ${role.name}`,
                0x2ecc71
            );
        });
    }

    // Rimozione Ruolo
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    if (removedRoles.size > 0) {
        removedRoles.forEach(role => {
            sendLog(
                newMember.guild,
                '➖ Ruolo Rimosso',
                `**Utente:** ${newMember.user.tag}\n**Ruolo:** ${role.name}`,
                0xe74c3c
            );
        });
    }
});

// ==========================================
// 5. LOG CANALI VOCALI
// ==========================================

client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    // Entrata in vocale
    if (!oldState.channelId && newState.channelId) {
        sendLog(
            newState.guild,
            '🔊 Entrato in Vocale',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${newState.channelId}>`,
            0x2ecc71
        );
    }

    // Uscita dalla vocale
    if (oldState.channelId && !newState.channelId) {
        sendLog(
            oldState.guild,
            '🔇 Uscito dalla Vocale',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${oldState.channelId}>`,
            0xe74c3c
        );
    }

    // Spostamento di canale vocale
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        sendLog(
            newState.guild,
            '🔄 Spostato di Vocale',
            `**Utente:** ${member.user.tag}\n**Da:** <#${oldState.channelId}>\n**A:** <#${newState.channelId}>`,
            0x3498db
        );
    }
});

// ==========================================
// 6. LOG BAN E UNBAN
// ==========================================

// Utente Bannato
client.on('guildBanAdd', async (ban) => {
    sendLog(
        ban.guild,
        '🔨 Utente Bannato',
        `**Utente:** ${ban.user.tag} (${ban.user.id})\n**Motivo:** ${ban.reason || 'Nessun motivo specificato'}`,
        0xff0000
    );
});

// Utente Sbannato
client.on('guildBanRemove', async (ban) => {
    sendLog(
        ban.guild,
        '🔓 Utente Sbannato',
        `**Utente:** ${ban.user.tag} (${ban.user.id})`,
        0x2ecc71
    );
});

// ==========================================
// 7. LOG EMOJI
// ==========================================

// Emoji Creata
client.on('emojiCreate', async (emoji) => {
    sendLog(
        emoji.guild,
        '😀 Emoji Aggiunta',
        `**Nome:** :${emoji.name}:\n**ID:** ${emoji.id}`,
        0x2ecc71
    );
});

// Emoji Eliminata
client.on('emojiDelete', async (emoji) => {
    sendLog(
        emoji.guild,
        '🗑️ Emoji Eliminata',
        `**Nome:** ${emoji.name}`,
        0xe74c3c
    );
});

// ==========================================
// 8. LOG TIMEOUT / MUTE / UNMUTE
// ==========================================

// Monitoraggio Timeout applicati o rimossi
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    // Applicazione Timeout
    if (!oldMember.isCommunicationDisabled() && newMember.isCommunicationDisabled()) {
        const timeoutUntil = newMember.communicationDisabledUntil;
        sendLog(
            newMember.guild,
            '🔇 Utente In isolamento (Timeout)',
            `**Utente:** ${newMember.user.tag} (<@${newMember.id}>)\n**Scade il:** <t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`,
            0xe67e22
        );
    }

    // Rimozione Timeout
    if (oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
        sendLog(
            newMember.guild,
            '🔊 Timeout Rimosso',
            `**Utente:** ${newMember.user.tag} (<@${newMember.id}>)`,
            0x2ecc71
        );
    }
});

// ==========================================
// 9. LOG INVITI
// ==========================================

// Invito Creato
client.on('inviteCreate', async (invite) => {
    sendLog(
        invite.guild,
        '✉️ Invito Creato',
        `**Creato da:** ${invite.inviter ? invite.inviter.tag : 'Sconosciuto'}\n**Codice:** ${invite.code}\n**Canale:** <#${invite.channel.id}>\n**Max Usi:** ${invite.maxUses || 'Illimitati'}`,
        0x3498db
    );
});

// Invito Eliminato
client.on('inviteDelete', async (invite) => {
    sendLog(
        invite.guild,
        '🗑️ Invito Eliminato',
        `**Codice:** ${invite.code}\n**Canale:** <#${invite.channel ? invite.channel.id : 'Sconosciuto'}>`,
        0xe74c3c
    );
});

// ==========================================
// 10. LOG EVENTI DEL SERVER
// ==========================================

// Evento Creato
client.on('guildScheduledEventCreate', async (event) => {
    sendLog(
        event.guild,
        '📅 Evento Creato',
        `**Nome:** ${event.name}\n**Inizio:** <t:${Math.floor(event.scheduledStartTimestamp / 1000)}:F>\n**Creatore:** <@${event.creatorId}>`,
        0x2ecc71
    );
});

// Evento Cancellato
client.on('guildScheduledEventDelete', async (event) => {
    sendLog(
        event.guild,
        '❌ Evento Cancellato',
        `**Nome:** ${event.name}`,
        0xe74c3c
    );
});

// Evento Modificato
client.on('guildScheduledEventUpdate', async (oldEvent, newEvent) => {
    if (oldEvent.status !== newEvent.status) {
        sendLog(
            newEvent.guild,
            '🔄 Stato Evento Modificato',
            `**Nome:** ${newEvent.name}\n**Nuovo Stato:** ${newEvent.status}`,
            0x3498db
        );
    }
});

// ==========================================
// 11. LOG MODIFICHE SERVER
// ==========================================

// Modifiche generali al Server (Nome, Icona, ecc.)
client.on('guildUpdate', async (oldGuild, newGuild) => {
    // Cambio Nome Server
    if (oldGuild.name !== newGuild.name) {
        sendLog(
            newGuild,
            '⚙️ Nome Server Modificato',
            `**Prima:** ${oldGuild.name}\n**Dopo:** ${newGuild.name}`,
            0xf1c40f
        );
    }

    // Cambio Icona Server
    if (oldGuild.icon !== newGuild.icon) {
        sendLog(
            newGuild,
            '🖼️ Icona Server Modificata',
            `L'icona del server è stata aggiornata.`,
            0xf1c40f
        );
    }

    // Cambio Livello di Verifica
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
        sendLog(
            newGuild,
            '🔒 Livello di Protezione Modificato',
            `**Prima:** ${oldGuild.verificationLevel}\n**Dopo:** ${newGuild.verificationLevel}`,
            0xe67e22
        );
    }
});


// ==========================================
// 12. LOG AUDIT (CHI HA FATTO L'AZIONE)
// ==========================================

// Audit Kick
client.on('guildMemberRemove', async (member) => {
    try {
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberKick,
        });
        const kickLog = fetchedLogs.entries.first();
        if (!kickLog) return;

        const { executor, target } = kickLog;
        if (target.id === member.id && kickLog.createdTimestamp > Date.now() - 5000) {
            sendLog(
                member.guild,
                '🦵 Membro Espulso (Kick)',
                `**Utente:** ${member.user.tag}\n**Moderatore:** ${executor.tag}\n**Motivo:** ${kickLog.reason || 'Nessun motivo'}`,
                0xe67e22
            );
        }
    } catch (e) {}
});

// Audit Mute / Unmute / Deafen in Vocale
client.on('voiceStateUpdate', async (oldState, newState) => {
    const guild = newState.guild || oldState.guild;
    const member = newState.member || oldState.member;

    // Server Mute applicato
    if (!oldState.serverMute && newState.serverMute) {
        sendLog(
            guild,
            '🔇 Silenziato nel Server',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${newState.channelId}>`,
            0xe67e22
        );
    }

    // Server Mute rimosso
    if (oldState.serverMute && !newState.serverMute) {
        sendLog(
            guild,
            '🔊 Mute Server Rimosso',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${newState.channelId}>`,
            0x2ecc71
        );
    }

    // Server Deafen applicato
    if (!oldState.serverDeaf && newState.serverDeaf) {
        sendLog(
            guild,
            '🎧 Cuffie Disattivate dal Server',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${newState.channelId}>`,
            0xe67e22
        );
    }
});

// ==========================================
// 13. LOG INTEGRAZIONI E WEBHOOK
// ==========================================

// Webhook Creato
client.on('webhookUpdate', async (channel) => {
    if (!channel.guild) return;
    sendLog(
        channel.guild,
        '🔗 Webhook Aggiornato/Creato',
        `**Canale:** <#${channel.id}>`,
        0x3498db
    );
});

// Stiker Creato
client.on('stickerCreate', async (sticker) => {
    if (!sticker.guild) return;
    sendLog(
        sticker.guild,
        '🏷️ Sticker Aggiunto',
        `**Nome:** ${sticker.name}\n**ID:** ${sticker.id}`,
        0x2ecc71
    );
});

// Sticker Eliminato
client.on('stickerDelete', async (sticker) => {
    if (!sticker.guild) return;
    sendLog(
        sticker.guild,
        '🗑️ Sticker Eliminato',
        `**Nome:** ${sticker.name}`,
        0xe74c3c
    );
});
