const mongoose = require("mongoose");

// --- SCHEMA SETUP (CONFIGURAZIONE SERVER) ---
const setupSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },

    // --- LOG SYSTEM ---
    logChannel: { type: String, default: null },
    logEnabled: { type: Boolean, default: false },

    // --- ANTI-LINK SYSTEM ---
    antiLinkChannel: { type: String, default: null },
    antiLinkEnabled: { type: Boolean, default: false },

    // --- ENTRY (BENVENUTO / ADDIO) ---
    welcomeChannel: { type: String, default: null },
    leaveChannel: { type: String, default: null },
    welcomeEnabled: { type: Boolean, default: true },
    leaveEnabled: { type: Boolean, default: true },

    // --- CANDIDATURE (APPLY) ---
    applyChannel: { type: String, default: null },
    applyEnabled: { type: Boolean, default: true },

    // --- POLL LOG SYSTEM ---
    pollLogChannel: { type: String, default: null }
}, { timestamps: true });

// --- SCHEMA POLL (SONDAGGI) ---
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

// --- SCHEMA WARN (MODERAZIONE E AVVERTIMENTI) ---
const warnSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    warnings: [
        {
            moderator: { type: String, required: true },
            reason: { type: String, required: true },
            date: { type: Number, default: Date.now }
        }
    ]
}, { timestamps: true });

// Prevenzione crash re-registrazione modelli
const Setup = mongoose.models.Setup || mongoose.model("Setup", setupSchema);
const Poll = mongoose.models.Poll || mongoose.model("Poll", pollSchema);
const Warn = mongoose.models.Warn || mongoose.model("Warn", warnSchema);

// Esportazione unificata
module.exports = { Setup, Poll, Warn };
