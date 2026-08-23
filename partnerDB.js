const fs = require('fs');
const path = './partners.json';

// Inizializza il file nella root se non esiste
if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// Estrae il codice d'invito Discord dal testo
function extractDiscordInvite(text) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite)\/([a-zA-Z0-9-]+)/i;
    const match = text.match(regex);
    return match ? match[1] : null;
}

// Carica il DB
function loadDB() {
    try {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (err) {
        return {};
    }
}

// Salva il DB
function saveDB(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// Salva una nuova partnership
function registerPartner(data) {
    const db = loadDB();
    const partnerId = Date.now().toString();

    db[partnerId] = {
        managerId: data.managerId,
        staffId: data.staffId,
        category: data.category,
        inviteCode: extractDiscordInvite(data.description),
        partnerChannelMsgId1: data.msg1Id,
        partnerChannelMsgId2: data.msg2Id,
        timestamp: Date.now(),
        reminded: false
    };

    saveDB(db);
    return partnerId;
}

// Sistema di controllo automatico (Link e Reminder)
function startAutoChecker(client, partnerChannelId, logChannelId) {
    setInterval(async () => {
        const db = loadDB();
        const now = Date.now();
        let updated = false;

        for (const [id, partner] of Object.entries(db)) {
            // 1. CHECK REMINDER 24H PER IL MANAGER
            if (!partner.reminded && (now - partner.timestamp) >= 24 * 60 * 60 * 1000) {
                try {
                    const manager = await client.users.fetch(partner.managerId);
                    if (manager) {
                        await manager.send(
                            `⏰ **Hey Manager!** Le 24 ore dalla tua ultima partnership su **Elegance Sponsoring** sono trascorse.\n` +
                            `Puoi fare una nuova partner! Apri un ticket nel server per rinnovare la tua presenza.`
                        );
                    }
                } catch (err) {
                    console.log(`Impossibile inviare DM a ${partner.managerId}`);
                }
                partner.reminded = true;
                updated = true;
            }

            // 2. CHECK SCADENZA LINK DISCORD
            if (partner.inviteCode) {
                try {
                    await client.fetchInvite(partner.inviteCode);
                } catch (error) {
                    const logChannel = client.channels.cache.get(logChannelId);
                    const partnerChannel = client.channels.cache.get(partnerChannelId);

                    // Elimina i messaggi dal canale partner
                    if (partnerChannel) {
                        if (partner.partnerChannelMsgId1) await partnerChannel.messages.delete(partner.partnerChannelMsgId1).catch(() => {});
                        if (partner.partnerChannelMsgId2) await partnerChannel.messages.delete(partner.partnerChannelMsgId2).catch(() => {});
                    }

                    // Log di rimozione
                    if (logChannel) {
                        await logChannel.send(
                            `🚨 **PARTNER RIMOSSA AUTOMATICAMENTE**\n` +
                            `📌 **Motivo:** Il link d'invito (\`${partner.inviteCode}\`) è scaduto o non è più valido.\n` +
                            `👤 **Manager:** <@${partner.managerId}>\n` +
                            `🛡️ **Staffer originale:** <@${partner.staffId}>`
                        );
                    }

                    delete db[id];
                    updated = true;
                }
            }
        }

        if (updated) saveDB(db);
    }, 60 * 1000); // Controlla ogni minuto
}

module.exports = { registerPartner, startAutoChecker };
