// ==========================================
// FILE: memorySystem.js (Sistema di Memoria Discord)
// ==========================================

const MEMORY_CHANNEL_ID = "1539699305705902201";

// Cache in memoria RAM per performance istantanee
const memoryCache = {
    warns: {},      // { userId: [ { reason, staffId, timestamp } ] }
    tickets: {},    // { userId: { channelId, openedAt } }
    setups: {},     // { key: value } (per log, antilink, entry, counting, ecc.)
    partners: {}    // Lista backup per le partnership
};

// Mappa dei tag per i messaggi fisso-stato
const TAGS = {
    WARNS: "[DATA_WARNS]",
    TICKETS: "[DATA_TICKETS]",
    SETUPS: "[DATA_SETUPS]",
    PARTNERS: "[DATA_PARTNERS]"
};

/**
 * Legge TUTTI i messaggi presenti nel canale di memoria (paginazione a blocchi di 100)
 */
async function loadMemoryFromChannel(client) {
    console.log("[MEMORY] 🧠 Scansione completa del canale di memoria in corso...");
    try {
        const channel = await client.channels.fetch(MEMORY_CHANNEL_ID).catch(() => null);
        if (!channel) {
            console.error("[MEMORY] ❌ Canale memoria non trovato! Controlla i permessi o l'ID.");
            return;
        }

        let allMessages = [];
        let lastId = null;

        // Loop per recuperare TUTTI i messaggi della storia (100 alla volta)
        while (true) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;

            const fetched = await channel.messages.fetch(options);
            if (fetched.size === 0) break;

            allMessages.push(...fetched.values());
            lastId = fetched.last().id;
        }

        console.log(`[MEMORY] 📥 Scaricati ${allMessages.length} messaggi dalla cronologia.`);

        // Cerchiamo gli ultimi messaggi con i TAG di stato
        for (const msg of allMessages) {
            const text = msg.content;

            if (text.startsWith(TAGS.WARNS) && Object.keys(memoryCache.warns).length === 0) {
                memoryCache.warns = parseJSONFromMessage(text) || {};
            } else if (text.startsWith(TAGS.TICKETS) && Object.keys(memoryCache.tickets).length === 0) {
                memoryCache.tickets = parseJSONFromMessage(text) || {};
            } else if (text.startsWith(TAGS.SETUPS) && Object.keys(memoryCache.setups).length === 0) {
                memoryCache.setups = parseJSONFromMessage(text) || {};
            } else if (text.startsWith(TAGS.PARTNERS) && Object.keys(memoryCache.partners).length === 0) {
                memoryCache.partners = parseJSONFromMessage(text) || {};
            }
        }

        console.log("[MEMORY] ✅ Dati caricati in memoria con successo!");
    } catch (error) {
        console.error("[MEMORY] ❌ Errore durante il caricamento della memoria:", error);
    }
}

/**
 * Estrae il JSON da un messaggio con TAG
 */
function parseJSONFromMessage(text) {
    try {
        const jsonString = text.substring(text.indexOf("```json") + 7, text.lastIndexOf("```")).trim();
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
}

/**
 * Aggiorna o crea il messaggio di stato fisso nel canale
 */
async function syncStateToChannel(client, tag, data) {
    try {
        const channel = await client.channels.fetch(MEMORY_CHANNEL_ID).catch(() => null);
        if (!channel) return;

        const content = `${tag}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

        // Cerca se esiste già un messaggio con questo tag
        const messages = await channel.messages.fetch({ limit: 50 });
        const existingMsg = messages.find(m => m.content.startsWith(tag));

        if (existingMsg) {
            await existingMsg.edit(content);
        } else {
            await channel.send(content);
        }
    } catch (error) {
        console.error(`[MEMORY] ❌ Errore sincronizzazione ${tag}:`, error);
    }
}

/**
 * Invia un LOG di azione nel canale memoria
 */
async function sendMemoryLog(client, logText) {
    try {
        const channel = await client.channels.fetch(MEMORY_CHANNEL_ID).catch(() => null);
        if (channel) {
            await channel.send(logText);
        }
    } catch (error) {
        console.error("[MEMORY] ❌ Errore invio log di memoria:", error);
    }
}

// ==========================================
// GESTIONE WARN (MAX 3 WARN PER UTENTE)
// ==========================================

async function addWarn(client, userId, staffId, reason) {
    if (!memoryCache.warns[userId]) {
        memoryCache.warns[userId] = [];
    }

    const userWarns = memoryCache.warns[userId];

    // Blocco ferreo sui 3 Warn
    if (userWarns.length >= 3) {
        return { success: false, count: userWarns.length, reason: "MAX_REACHED" };
    }

    userWarns.push({
        staffId: staffId,
        reason: reason,
        timestamp: Date.now()
    });

    const currentCount = userWarns.length;

    // Sincronizza lo stato fisso
    await syncStateToChannel(client, TAGS.WARNS, memoryCache.warns);

    // Invia il Log di memoria
    const timestampFormatted = `<t:${Math.floor(Date.now() / 1000)}:f>`;
    await sendMemoryLog(client, `📝 **[LOG_WARN]** <@${userId}> (\`${userId}\`) ammonito da <@${staffId}> | **Motivo:** ${reason} | **Totale:** \`${currentCount}/3\` | ${timestampFormatted}`);

    return { success: true, count: currentCount };
}

async function removeWarn(client, userId, staffId, warnIndex = -1) {
    if (!memoryCache.warns[userId] || memoryCache.warns[userId].length === 0) {
        return { success: false, reason: "NO_WARNS" };
    }

    const userWarns = memoryCache.warns[userId];
    
    // Se warnIndex è -1, rimuove l'ultimo warn ricevuto
    if (warnIndex === -1) {
        userWarns.pop();
    } else if (warnIndex >= 0 && warnIndex < userWarns.length) {
        userWarns.splice(warnIndex, 1);
    }

    if (userWarns.length === 0) {
        delete memoryCache.warns[userId];
    }

    const remainingCount = memoryCache.warns[userId] ? memoryCache.warns[userId].length : 0;

    // Sincronizza lo stato fisso
    await syncStateToChannel(client, TAGS.WARNS, memoryCache.warns);

    // Invia il Log di memoria
    const timestampFormatted = `<t:${Math.floor(Date.now() / 1000)}:f>`;
    await sendMemoryLog(client, `🗑️ **[LOG_UNWARN]** Rimosso 1 warn a <@${userId}> (\`${userId}\`) da <@${staffId}> | **Rimanenti:** \`${remainingCount}/3\` | ${timestampFormatted}`);

    return { success: true, count: remainingCount };
}

function getWarns(userId) {
    return memoryCache.warns[userId] || [];
}

// ==========================================
// GESTIONE TICKET
// ==========================================

async function setTicketOpened(client, userId, channelId) {
    memoryCache.tickets[userId] = {
        channelId: channelId,
        openedAt: Date.now()
    };

    await syncStateToChannel(client, TAGS.TICKETS, memoryCache.tickets);
    await sendMemoryLog(client, `🎫 **[LOG_TICKET_OPEN]** Aperto ticket per <@${userId}> in <#${channelId}>`);
}

async function setTicketClosed(client, userId) {
    if (memoryCache.tickets[userId]) {
        delete memoryCache.tickets[userId];
        await syncStateToChannel(client, TAGS.TICKETS, memoryCache.tickets);
        await sendMemoryLog(client, `🔒 **[LOG_TICKET_CLOSE]** Chiuso ticket per <@${userId}>`);
    }
}

function getOpenTicket(userId) {
    return memoryCache.tickets[userId] || null;
}

// ==========================================
// GESTIONE SETUP CONFIG (Log, AntiLink, ecc.)
// ==========================================

async function saveSetupConfig(client, key, value) {
    memoryCache.setups[key] = value;
    await syncStateToChannel(client, TAGS.SETUPS, memoryCache.setups);
    await sendMemoryLog(client, `⚙️ **[LOG_SETUP]** Aggiornata configurazione \`${key}\`: \`${JSON.stringify(value)}\``);
}

function getSetupConfig(key) {
    return memoryCache.setups[key] || null;
}

module.exports = {
    loadMemoryFromChannel,
    addWarn,
    removeWarn,
    getWarns,
    setTicketOpened,
    setTicketClosed,
    getOpenTicket,
    saveSetupConfig,
    getSetupConfig,
    memoryCache
};
          
