// achievements.js
const inventory = require("./inventory");

const ACHIEVEMENTS = {
    // ==========================================
    // 💬 SERVER & CHAT (Attività globale)
    // ==========================================
    "socializzazione": { title: "👋 Rottura del Ghiaccio", desc: "Hai inviato il tuo primo messaggio!", req: (stats) => stats.messages >= 1 },
    "chiacchierone": { title: "🗣️ Chiacchierone", desc: "Hai inviato 50 messaggi nel server.", req: (stats) => stats.messages >= 50 },
    "oratore": { title: "🎙️ Oratore Seriale", desc: "Hai inviato 500 messaggi! Ormai vivi qui.", req: (stats) => stats.messages >= 500 },
    "spammone": { title: "⌨️ Tastiera Infuocata", desc: "Hai raggiunto 2.000 messaggi! Riposati un po'.", req: (stats) => stats.messages >= 2000 },
    
    "primo_invito": { title: "💌 Reclutatore Novizio", desc: "Hai invitato la tua prima persona nel server.", req: (stats) => stats.invites >= 1 },
    "influencer": { title: "🌟 Influencer", desc: "Hai invitato ben 10 persone nel server!", req: (stats) => stats.invites >= 10 },

    // ==========================================
    // 💰 ECONOMIA 
    // ==========================================
    "risparmiatore": { title: "🪙 Risparmiatore", desc: "Hai accumulato le tue prime 500 monete.", req: (stats, user) => user.coins >= 500 },
    "capitalista": { title: "💸 Zio Paperone", desc: "Hai raggiunto 5.000 monete nel portafoglio!", req: (stats, user) => user.coins >= 5000 },

    // ==========================================
    // ⛏️ CRAFTING & MINECRAFT VIBES
    // ==========================================
    "getting_wood": { 
        title: "🪵 Getting Wood", 
        desc: "Hai craftato il tuo primo oggetto in assoluto.", 
        req: (stats) => stats.itemsCrafted >= 1 
    },
    "time_to_mine": { 
        title: "⛏️ Time to Mine!", 
        desc: "Hai craftato un Piccone. Ora si scava sul serio!", 
        req: (stats, user) => (user.items["Piccone di Ferro"] || 0) >= 1 
    },
    "time_to_strike": { 
        title: "⚔️ Time to Strike!", 
        desc: "Hai craftato una Spada. I mostri tremano.", 
        req: (stats, user) => (user.items["Spada di Metallo"] || 0) >= 1 
    },
    "magia_oscura": { 
        title: "🔮 Stregone", 
        desc: "Hai craftato l'Amuleto Magico (Oggetto Speciale).", 
        req: (stats, user) => (user.items["Amuleto Magico"] || 0) >= 1 
    },
    "mastro_costruttore": { 
        title: "🛠️ Mastro Costruttore", 
        desc: "Hai craftato ben 20 oggetti totali.", 
        req: (stats) => stats.itemsCrafted >= 20 
    },

    // ==========================================
    // ⭐ PROGRESSIONE GLOBALE (XP)
    // ==========================================
    "livello_bronzo": { title: "🥉 Rango Bronzo", desc: "Hai raggiunto 500 XP.", req: (stats, user) => user.xp >= 500 },
    "livello_argento": { title: "🥈 Rango Argento", desc: "Hai raggiunto 2.000 XP.", req: (stats, user) => user.xp >= 2000 },
    "livello_oro": { title: "🥇 Rango Oro", desc: "Hai raggiunto 5.000 XP.", req: (stats, user) => user.xp >= 5000 },
    "leggenda": { title: "👑 Leggenda Vivente", desc: "Hai raggiunto i 20.000 XP. Inchinatevi!", req: (stats, user) => user.xp >= 20000 },

    // ==========================================
    // 🎮 MINIGIOCHI - GENERALI
    // ==========================================
    "novellino": { title: "🕹️ Insert Coin", desc: "Hai giocato al tuo primo minigioco.", req: (stats) => stats.gamesPlayed >= 1 },
    "giocatore_assiduo": { title: "🎰 Dipendente dall'Arcade", desc: "Hai giocato a 50 minigiochi totali.", req: (stats) => stats.gamesPlayed >= 50 },
    "vincitore_seriale": { title: "🏆 Asso Pigliatutto", desc: "Hai vinto 100 minigiochi in totale!", req: (stats) => stats.gamesWon >= 100 },

    // ==========================================
    // 🎯 MINIGIOCHI - SPECIFICI
    // ==========================================
    "secchione": { title: "🧠 Secchione", desc: "Hai vinto 5 Quiz.", req: (stats) => stats.quizzesWon >= 5 },
    "tuttologo": { title: "📚 Enciclopedia Umana", desc: "Hai vinto 50 Quiz!", req: (stats) => stats.quizzesWon >= 50 },
    "artificiere": { title: "✂️ Mani Fermissime", desc: "Hai disinnescato 3 bombe.", req: (stats) => stats.bombsDefused >= 3 },
    "eroe_nazionale": { title: "🦸‍♂️ Eroe Nazionale", desc: "Hai salvato il server disinnescando 20 bombe!", req: (stats) => stats.bombsDefused >= 20 },
    "mente_fotografica": { title: "📸 Mente Fotografica", desc: "Hai vinto 10 partite a Memory.", req: (stats) => stats.memoryWon >= 10 },
    "dita_fulminee": { title: "⚡ Dita Fulminee", desc: "Hai vinto 10 partite a Reaction Game.", req: (stats) => stats.reactionWon >= 10 },
    "salvavita": { title: "🪢 Avvocato Difensore", desc: "Hai salvato 10 omini all'Impiccato.", req: (stats) => stats.hangmanWon >= 10 },
    "sbancatore": { title: "🎰 Jackpot!", desc: "Hai sbancato vincendo il Jackpot massimo alla Ruota!", req: (stats) => stats.jackpots >= 1 }
};

const CHANNEL_ID = "1528576173972521012";

/**
 * Controlla gli achievement e invia la notifica nel canale designato
 * @param {string} userId 
 * @param {import('discord.js').Client} client 
 */
async function checkAndNotify(userId, client) {
    const user = inventory.getUser(userId);
    const unlockedNow = [];

    for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
        if (!user.achievements.includes(id)) {
            if (ach.req(user.stats, user)) {
                inventory.unlockAchievement(userId, id);
                unlockedNow.push(`🏆 **${ach.title}**\n*${ach.desc}*`);
                
                // Ricompensa automatica per l'achievement
                inventory.addCoins(userId, 50); 
                inventory.addXP(userId, 100);
            }
        }
    }

    // Se ha sbloccato qualcosa, invia il messaggio nel canale specifico
    if (unlockedNow.length > 0 && client) {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (channel && channel.isTextBased()) {
                const userMention = `<@${userId}>`;
                await channel.send(`🎉 Complimenti ${userMention}! Ha sbloccato nuovi traguardi:\n\n${unlockedNow.join("\n\n")}`);
            }
        } catch (err) {
            console.error("Impossibile inviare l'achievement nel canale:", err);
        }
    }

    return unlockedNow;
}

module.exports = { checkAndNotify, ACHIEVEMENTS };
            
