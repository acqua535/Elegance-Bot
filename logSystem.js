const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// File locale JSON nella stessa cartella principale
const configPath = path.join(__dirname, "logConfig.json");

// Helper per recuperare l'ID del canale
function getLogChannel(guild) {
    if (!fs.existsSync(configPath)) return null;
    try {
        const data = JSON.parse(fs.readFileSync(configPath, "utf8"));
        return data.channelId ? guild.channels.cache.get(data.channelId) : null;
    } catch {
        return null;
    }
}

module.exports = (client) => {
    // 📥 1. UTENTE ENTRATO
    client.on("guildMemberAdd", async (member) => {
        const logChannel = getLogChannel(member.guild);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("📥 Utente Entrato")
            .setColor(0x57F287)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Utente", value: `${member.user} (\`${member.user.id}\`)`, inline: true },
                { name: "📅 Creato il", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: `Membri totali: ${member.guild.memberCount}` })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    });

    // 📤 2. UTENTE USCITO
    client.on("guildMemberRemove", async (member) => {
        const logChannel = getLogChannel(member.guild);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("📤 Utente Uscito")
            .setColor(0xED4245)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Utente", value: `${member.user.tag} (\`${member.user.id}\`)`, inline: true }
            )
            .setFooter({ text: `Membri rimasti: ${member.guild.memberCount}` })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    });

    // 🗑️ 3. MESSAGGIO ELIMINATO
    client.on("messageDelete", async (message) => {
        if (!message.guild || message.author?.bot) return;
        const logChannel = getLogChannel(message.guild);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("🗑️ Messaggio Eliminato")
            .setColor(0xED4245)
            .addFields(
                { name: "👤 Autore", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
                { name: "📌 Canale", value: `${message.channel}`, inline: true },
                { name: "📝 Contenuto", value: message.content ? (message.content.length > 1000 ? message.content.substring(0, 1000) + "..." : message.content) : "*Nessun testo*" }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    });

    // ✏️ 4. MESSAGGIO MODIFICATO
    client.on("messageUpdate", async (oldMessage, newMessage) => {
        if (!oldMessage.guild || oldMessage.author?.bot || oldMessage.content === newMessage.content) return;
        const logChannel = getLogChannel(oldMessage.guild);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("✏️ Messaggio Modificato")
            .setColor(0xFEE75C)
            .addFields(
                { name: "👤 Autore", value: `${oldMessage.author} (\`${oldMessage.author.id}\`)`, inline: true },
                { name: "📌 Canale", value: `${oldMessage.channel}`, inline: true },
                { name: "⬅️ Prima", value: oldMessage.content ? oldMessage.content.substring(0, 500) : "*Vuoto*" },
                { name: "➡️ Dopo", value: newMessage.content ? newMessage.content.substring(0, 500) : "*Vuoto*" }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    });

    // 🔊 5. CANALI VOCALI
    client.on("voiceStateUpdate", async (oldState, newState) => {
        const guild = newState.guild || oldState.guild;
        const logChannel = getLogChannel(guild);
        if (!logChannel) return;

        const member = newState.member || oldState.member;

        // Entrato
        if (!oldState.channelId && newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle("🔊 Connessione Vocale")
                .setColor(0x57F287)
                .addFields(
                    { name: "👤 Utente", value: `${member.user} (\`${member.id}\`)`, inline: true },
                    { name: "📌 Canale", value: `<#${newState.channelId}>`, inline: true }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] });
        }

        // Uscito
        if (oldState.channelId && !newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle("🔇 Disconnessione Vocale")
                .setColor(0xED4245)
                .addFields(
                    { name: "👤 Utente", value: `${member.user} (\`${member.id}\`)`, inline: true },
                    { name: "📌 Canale Lasciato", value: `<#${oldState.channelId}>`, inline: true }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] });
        }

        // Spostato
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle("🔄 Spostamento Vocale")
                .setColor(0x5865F2)
                .addFields(
                    { name: "👤 Utente", value: `${member.user} (\`${member.id}\`)`, inline: false },
                    { name: "⬅️ Da", value: `<#${oldState.channelId}>`, inline: true },
                    { name: "➡️ A", value: `<#${newState.channelId}>`, inline: true }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] });
        }
    });

    // 📁 6. CREAZIONE / ELIMINAZIONE CANALI
    client.on("channelCreate", async (channel) => {
        if (!channel.guild) return;
        const logChannel = getLogChannel(channel.guild);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("📁 Canale Creato")
            .setColor(0x57F287)
            .addFields({ name: "📌 Nome", value: `${channel.name}`, inline: true })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    });

    client.on("channelDelete", async (channel) => {
        if (!channel.guild) return;
        const logChannel = getLogChannel(channel.guild);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("🗑️ Canale Eliminato")
            .setColor(0xED4245)
            .addFields({ name: "📌 Nome", value: `${channel.name}`, inline: true })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    });

    // 🔨 7. BAN UTENTE
    client.on("guildBanAdd", async (ban) => {
        const logChannel = getLogChannel(ban.guild);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle("🔨 Utente Bannato")
            .setColor(0xED4245)
            .addFields(
                { name: "👤 Utente", value: `${ban.user.tag} (\`${ban.user.id}\`)`, inline: true },
                { name: "📝 Motivo", value: ban.reason || "Nessun motivo specificato" }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    });
};
                                                                 
