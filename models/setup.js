const mongoose = require("mongoose");

const setupSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannel: { type: String, default: null },
    logEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Setup", setupSchema);
