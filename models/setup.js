const mongoose = require("mongoose");

const setupSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    
    // 📌 Log System
    logChannel: { type: String, default: null },
    logEnabled: { type: Boolean, default: true },
    
    // 📌 AntiLink System
    antiLinkEnabled: { type: Boolean, default: false },
    antiLinkLogChannel: { type: String, default: null },

    // 📌 Counting System
    countingChannel: { type: String, default: null },
    countingNumber: { type: Number, default: 0 },
    countingLastUser: { type: String, default: null },

    // 📌 Entry / Welcome System
    entryChannel: { type: String, default: null },
    entryRole: { type: String, default: null },

    // 📌 Apply System
    applyChannel: { type: String, default: null },
    applyCategory: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Setup || mongoose.model("Setup", setupSchema);
