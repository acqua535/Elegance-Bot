// achievements.js

// Lista massiccia di Achievement (esclusivamente basati su server, economia, livelli e social)
const ACHIEVEMENTS_LIST = {
    // --- CATEGORIA: PRIMI PASSI ---
    first_step: { name: "🌱 Primo Passo", desc: "Compi la tua prima azione nel bot.", rewardCoins: 50, rewardXp: 100 },
    profile_check: { name: "🪞 Specchio delle Mie Bramame", desc: "Visualizza il tuo profilo per la prima volta.", rewardCoins: 30, rewardXp: 50 },
    
    // --- CATEGORIA: ECONOMIA & RICCHEZZA ---
    rich_1: { name: "💰 Risparmiatore", desc: "Raggiungi un totale di 500 monete.", rewardCoins: 100, rewardXp: 200 },
    rich_2: { name: "🪙 Banchiere", desc: "Raggiungi un totale di 2.500 monete.", rewardCoins: 500, rewardXp: 1000 },
    rich_3: { name: "💎 Paperon de' Paperoni", desc: "Raggiungi la cifra capogiro di 10.000 monete.", rewardCoins: 2000, rewardXp: 5000 },
    gambler_1: { name: "🎲 Tentatore della Sorte", desc: "Usa la ruota della fortuna 10 volte.", rewardCoins: 150, rewardXp: 300 },
    jackpot_winner: { name: "🎰 Baciato dalla Fortuna", desc: "Vinci il jackpot alla Ruota della Fortuna.", rewardCoins: 1000, rewardXp: 2500 },
    daily_streak_3: { name: "🔥 Costanza", desc: "Riscatta il premio giornaliero per 3 giorni di fila.", rewardCoins: 150, rewardXp: 300 },
    daily_streak_7: { name: "🌟 Fedelissimo", desc: "Riscatta il premio giornaliero per 7 giorni di fila.", rewardCoins: 500, rewardXp: 1200 },
    daily_streak_30: { name: "👑 Dedizione Totale", desc: "Riscatta il premio giornaliero per 30 giorni di fila.", rewardCoins: 2500, rewardXp: 6000 },

    // --- CATEGORIA: LIVELLI & ESPERIENZA ---
    level_5: { name: "⭐ Livello 5", desc: "Raggiungi il livello 5 di esperienza.", rewardCoins: 200, rewardXp: 400 },
    level_10: { name: "🌟 Livello 10", desc: "Raggiungi il livello 10 di esperienza.", rewardCoins: 500, rewardXp: 1000 },
    level_25: { name: "💫 Livello 25", desc: "Raggiungi il livello 25 di esperienza.", rewardCoins: 1500, rewardXp: 3000 },
    level_50: { name: "👑 Leggenda Vivente", desc: "Raggiungi il prestigioso livello 50.", rewardCoins: 5000, rewardXp: 10000 },

    // --- CATEGORIA: SOCIAL & INTERAZIONE ---
    chatty_1: { name: "💬 Chiacchierone", desc: "Invia 100 messaggi nel server.", rewardCoins: 150, rewardXp: 300 },
    chatty_2: { name: "🗣️ Re della Chat", desc: "Invia 1.000 messaggi nel server.", rewardCoins: 1000, rewardXp: 2500 },
    chatty_3: { name: "📢 Speaker Ufficiale", desc: "Invia 5.000 messaggi nel server.", rewardCoins: 3000, rewardXp: 7500 },
    chatty_4: { name: "📜 Leggenda della Tastiera", desc: "Invia ben 20.000 messaggi nel server.", rewardCoins: 10000, rewardXp: 20000 },
    
    invite_1: { name: "🤝 Reclutatore", desc: "Invita 3 amici nel server.", rewardCoins: 300, rewardXp: 600 },
    invite_2: { name: "🌐 Portatore di Anime", desc: "Invita 10 amici nel server.", rewardCoins: 1000, rewardXp: 2500 },
    invite_3: { name: "🏰 Fondatore di Imperi", desc: "Invita ben 25 amici nel server.", rewardCoins: 3000, rewardXp: 8000 },

    // --- CATEGORIA: TICKETS & SUPPORTO ---
    ticket_1: { name: "🎫 Richiesta d'Aiuto", desc: "Apri il tuo primo ticket di supporto.", rewardCoins: 50, rewardXp: 100 },
    ticket_2: { name: "🤝 Cliente Abituale", desc: "Apri almeno 10 ticket nel corso del tempo.", rewardCoins: 300, rewardXp: 700 },
    ticket_resolver: { name: "🛠️ Problem Solver", desc: "Chiudi o risolvi 5 ticket con successo.", rewardCoins: 400, rewardXp: 900 },

    // --- CATEGORIA: VERIFICA & SICUREZZA ---
    verified: { name: "🛡️ Cittadino Esemplare", desc: "Completa con successo il sistema di verifica.", rewardCoins: 100, rewardXp: 250 },
    two_factor: { name: "🔒 Account blindato", desc: "Proteggi il tuo account con i livelli di sicurezza richiesti.", rewardCoins: 150, rewardXp: 300 },
    
    // --- CATEGORIA: CANDIDATURE & STAFF ---
    apply_sent: { name: "📝 Aspirante Staff", desc: "Invia una candidatura per entrare nello staff.", rewardCoins: 200, rewardXp: 500 },
    feedback_given: { name: "💡 Mente Illuminata", desc: "Invia un suggerimento utile tramite i comandi del bot.", rewardCoins: 150, rewardXp: 350 },

    // --- CATEGORIA: ESPLORAZIONE & TEMPORALI ---
    night_owl: { name: "🌙 Gufo Notturno", desc: "Usa il bot in piena notte (tra le 02:00 e le 05:00).", rewardCoins: 250, rewardXp: 500 },
    early_bird: { name: "☀️ Mattiniero", desc: "Usa il bot la mattina presto (tra le 05:00 e le 08:00).", rewardCoins: 250, rewardXp: 500 },
    weekend_warrior: { name: "🎉 Guerriero del Weekend", desc: "Usa il bot durante il fine settimana.", rewardCoins: 150, rewardXp: 300 },
    
    // --- CATEGORIA: COLLEZIONISMO ---
    collector_1: { name: "📦 Collezionista", desc: "Sblocca 5 achievement totali.", rewardCoins: 300, rewardXp: 800 },
    collector_2: { name: "🎖️ Cacciatore di Trofei", desc: "Sblocca 15 achievement totali.", rewardCoins: 1000, rewardXp: 2500 },
    collector_3: { name: "🏆 Completista Supremo", desc: "Sblocca ben 30 achievement totali.", rewardCoins: 3500, rewardXp: 8000 }
};

// Funzione di controllo traguardi (collegabile al sistema di database principale del bot)
async function checkAndNotify(userId, client, specificKey = null) {
    return true;
}

module.exports = {
    ACHIEVEMENTS_LIST,
    checkAndNotify
};
        
