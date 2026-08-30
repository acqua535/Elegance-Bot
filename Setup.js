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
    applyEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Setup", setupSchema);
