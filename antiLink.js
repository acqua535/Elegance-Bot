const { EmbedBuilder } = require("discord.js");
const moderation = require("./moderationSystem"); // 📌 Colleghiamo il sistema di moderazione centrale

// 📌 ID DEL CANALE LOG PER L'ANTI-LINK
const LOG_CHANNEL_ID = "1528576197741772902";

module.exports = (client) => {
    client.on("messageCreate", async (message) => {
        try {
            // Ignora bot, messaggi privati e staff/amministratori
            if (message.author.bot || !message.guild) return;
            if (message.member && message.member.permissions.has("Administrator")) return;

            const content = message.content;

            // 🛡️ REGEX BLINDATA ANTI-LINK (Trova HTTP/HTTPS, WWW, Discord Invites, IP e Dominio.estensione)
            const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(discord\.(gg|io|me|li|com\/invite)\/[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|edu|gov|mil|int|biz|info|name|pro|tech|xyz|online|site|store|app|dev|io|co|it|fr|de|uk|es|ru|eu|me|tv|cc|tk|ml|ga|cf|gq)[^\s]*)|(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)/gi;

            if (!linkRegex.test(content)) return;

            // 1. 🗑️ CANCELLAZIONE IMMEDIATA DEL MESSAGGIO
            await message.delete().catch(() => {});

            // 2. ⚠️ REGISTRAZIONE DEL WARN REALE TRAMITE moderationSystem.js
            const reason = "Invio di link non autorizzato (Anti-Link Automatico)";
            const totalWarns = moderation.addWarning(
                message.author.id,  // ID dell'utente
                client.user.id,     // ID del Bot che esegue l'azione
                reason
            );

            // 3. 💬 AVVISO ALL'UTENTE NEL CANALE
            const alertMsg = await message.channel.send({
                content: `⚠️ ${message.author}, è vietato inviare link! Il tuo messaggio è stato rimosso e hai ricevuto un **Warn automatico** (Totale warn: **${totalWarns}**).`
            }).catch(() => {});
            
            setTimeout(() => alertMsg?.delete().catch(() => {}), 6000);

            // 4. 📝 LOG DETTAGLIATO PER LO STAFF
            const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
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
                        { name: "⚙️ Azione", value: "Messaggio eliminato & Warn registrato in moderationSystem.js", inline: false }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
            }

        } catch (error) {
            console.error("🚨 Errore nel modulo Anti-Link:", error);
        }
    });
};
