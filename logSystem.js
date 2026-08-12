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

    // Mute/Deafen lato server
    if (!oldState.serverMute && newState.serverMute) {
        sendLog(
            newState.guild,
            '🔇 Silenziato nel Server',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${newState.channelId}>`,
            0xe67e22
        );
    }

    if (oldState.serverMute && !newState.serverMute) {
        sendLog(
            newState.guild,
            '🔊 Mute Server Rimosso',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${newState.channelId}>`,
            0x2ecc71
        );
    }
});

// ==========================================
// 6. LOG BAN, UNBAN E TIMEOUT
// ==========================================

client.on('guildBanAdd', async (ban) => {
    sendLog(
        ban.guild,
        '🔨 Utente Bannato',
        `**Utente:** ${ban.user.tag} (${ban.user.id})\n**Motivo:** ${ban.reason || 'Nessun motivo specificato'}`,
        0xff0000
    );
});

client.on('guildBanRemove', async (ban) => {
    sendLog(
        ban.guild,
        '🔓 Utente Sbannato',
        `**Utente:** ${ban.user.tag} (${ban.user.id})`,
        0x2ecc71
    );
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (!oldMember.isCommunicationDisabled() && newMember.isCommunicationDisabled()) {
        const timeoutUntil = newMember.communicationDisabledUntil;
        sendLog(
            newMember.guild,
            '🔇 Timeout Applicato',
            `**Utente:** ${newMember.user.tag} (<@${newMember.id}>)\n**Scade il:** <t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`,
            0xe67e22
        );
    }

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
// 7. LOG INVITI ED EVENTI
// ==========================================

client.on('inviteCreate', async (invite) => {
    sendLog(
        invite.guild,
        '✉️ Invito Creato',
        `**Creato da:** ${invite.inviter ? invite.inviter.tag : 'Sconosciuto'}\n**Codice:** ${invite.code}\n**Canale:** <#${invite.channel.id}>`,
        0x3498db
    );
});

client.on('inviteDelete', async (invite) => {
    sendLog(
        invite.guild,
        '🗑️ Invito Eliminato',
        `**Codice:** ${invite.code}\n**Canale:** <#${invite.channel ? invite.channel.id : 'Sconosciuto'}>`,
        0xe74c3c
    );
});

client.on('guildScheduledEventCreate', async (event) => {
    sendLog(
        event.guild,
        '📅 Evento Creato',
        `**Nome:** ${event.name}\n**Inizio:** <t:${Math.floor(event.scheduledStartTimestamp / 1000)}:F>`,
        0x2ecc71
    );
});

// ==========================================
// 8. LOG EMOJI E STICKER
// ==========================================

client.on('emojiCreate', async (emoji) => {
    sendLog(
        emoji.guild,
        '😀 Emoji Aggiunta',
        `**Nome:** :${emoji.name}:\n**ID:** ${emoji.id}`,
        0x2ecc71
    );
});

client.on('emojiDelete', async (emoji) => {
    sendLog(
        emoji.guild,
        '🗑️ Emoji Eliminata',
        `**Nome:** ${emoji.name}`,
        0xe74c3c
    );
});

client.on('stickerCreate', async (sticker) => {
    if (!sticker.guild) return;
    sendLog(
        sticker.guild,
        '🏷️ Sticker Aggiunto',
        `**Nome:** ${sticker.name}\n**ID:** ${sticker.id}`,
        0x2ecc71
    );
});

client.on('stickerDelete', async (sticker) => {
    if (!sticker.guild) return;
    sendLog(
        sticker.guild,
        '🗑️ Sticker Eliminato',
        `**Nome:** ${sticker.name}`,
        0xe74c3c
    );
});

// ==========================================
// LOGIN CON VARIABILE DISCLOUD
// ==========================================

client.login(process.env.TOKEN);
