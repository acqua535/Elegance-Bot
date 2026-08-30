const mongoose = require("mongoose");

const setupSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    
    // Log System
    logChannel: { type: String, default: null },
    
    // Anti-Link System
    antiLinkEnabled: { type: Boolean, default: false },
    antiLinkLogChannel: { type: String, default: null },

    // Altre configurazioni
    ticketCategory: { type: String, default: null },
    welcomeChannel: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Setup || mongoose.model("Setup", setupSchema);
