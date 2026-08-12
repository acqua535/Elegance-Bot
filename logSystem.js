require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Inizializzazione Client
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
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationExecution
    ]
});

const LOG_CHANNEL_ID = '1528576197741772902';

async function sendLog(guild, title, description, color = 0x2b2d31) {
    if (!guild) return;
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

client.on('channelCreate', async (channel) => {
    if (!channel.guild) return;
    sendLog(
        channel.guild,
        '➕ Canale Creato',
        `**Nome:** ${channel.name}\n**Tipo:** ${channel.type}\n**ID:** ${channel.id}`,
        0x2ecc71
    );
});

client.on('channelDelete', async (channel) => {
    if (!channel.guild) return;
    sendLog(
        channel.guild,
        '➖ Canale Eliminato',
        `**Nome:** ${channel.name}\n**ID:** ${channel.id}`,
        0xe74c3c
    );
});

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

client.on('roleCreate', async (role) => {
    sendLog(
        role.guild,
        '🛡️ Ruolo Creato',
        `**Nome:** ${role.name}\n**ID:** ${role.id}`,
        0x2ecc71
    );
});

client.on('roleDelete', async (role) => {
    sendLog(
        role.guild,
        '🗑️ Ruolo Eliminato',
        `**Nome:** ${role.name}\n**ID:** ${role.id}`,
        0xe74c3c
    );
});

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

// ==========================================
// 4. LOG MEMBRI
// ==========================================

client.on('guildMemberAdd', async (member) => {
    sendLog(
        member.guild,
        '📥 Membro Entrato',
        `**Utente:** ${member.user.tag} (<@${member.id}>)\n**ID:** ${member.id}\n**Account Creato:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        0x2ecc71
    );
});

client.on('guildMemberRemove', async (member) => {
    sendLog(
        member.guild,
        '📤 Membro Uscito',
        `**Utente:** ${member.user.tag} (<@${member.id}>)\n**ID:** ${member.id}`,
        0xe74c3c
    );
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
        sendLog(
            newMember.guild,
            '✏️ Nickname Modificato',
            `**Utente:** ${newMember.user.tag}\n**Prima:** ${oldMember.nickname || oldMember.user.username}\n**Dopo:** ${newMember.nickname || newMember.user.username}`,
            0x3498db
        );
    }

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
// 5. LOG CANALI VOCALI
// ==========================================

client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
        sendLog(
            newState.guild,
            '🔊 Entrato in Vocale',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${newState.channelId}>`,
            0x2ecc71
        );
    }

    if (oldState.channelId && !newState.channelId) {
        sendLog(
            oldState.guild,
            '🔇 Uscito dalla Vocale',
            `**Utente:** ${member.user.tag}\n**Canale:** <#${oldState.channelId}>`,
            0xe74c3c
        );
    }

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        sendLog(
            newState.guild,
            '🔄 Spostato di Vocale',
            `**Utente:** ${member.user.tag}\n**Da:** <#${oldState.channelId}>\n**A:** <#${newState.channelId}>`,
            0x3498db
        );
    }

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
// 6. LOG BAN E UNBAN
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
// 8. LOG EMOJI, STICKER E AUTOMOD
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

client.on('autoModerationActionExecution', async (execution) => {
    sendLog(
        execution.guild,
        '🛡️ AutoMod Intervenuto',
        `**Utente:** <@${execution.userId}>\n**Canale:** <#${execution.channelId}>`,
        0xe74c3c
    );
});

// ==========================================
// LOGIN DISCLOUD
// ==========================================

client.login(process.env.TOKEN);
            
