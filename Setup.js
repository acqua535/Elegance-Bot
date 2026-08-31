const mongoose = require("mongoose");

const setupSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },

    // --- LOG SYSTEM ---
    logChannel: { type: String, default: null },
    logEnabled: { type: Boolean, default: false },

    // --- ANTI-LINK SYSTEM ---
    antiLinkChannel: { type: String, default: null },
    antiLinkEnabled: { type: Boolean, default: false },

    // --- ENTRY (BENVENUTO / ADDIO) ---
    entryChannel: { type: String, default: null },
    entryRole: { type: String, default: null },

    // --- CANDIDATURE (APPLY) ---
    applyChannel: { type: String, default: null },
    applyEnabled: { type: Boolean, default: true },

    // --- POLL LOG SYSTEM ---
    pollLogChannel: { type: String, default: null }
}, { timestamps: true });

// --- SCHEMA PER I SONDAGGI (POLL) ---
const pollSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    isMultiple: { type: Boolean, default: false },
    endTime: { type: Number, required: true },
    votes: { type: Map, of: [Number], default: {} },
    ended: { type: Boolean, default: false }
}, { timestamps: true });

// Questo controlla se i modelli esistono già nella connessione attiva, evitando il crash
const Setup = mongoose.models.Setup || mongoose.model("Setup", setupSchema);
const Poll = mongoose.models.Poll || mongoose.model("Poll", pollSchema);

module.exports = { Setup, Poll };
