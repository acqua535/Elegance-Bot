const mongoose = require('mongoose');

if (!mongoose) {
    throw new Error("Mongoose non è stato caricato correttamente!");
}

const setupSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannel: { type: String, default: null },
    logEnabled: { type: Boolean, default: false },
    antiLinkChannel: { type: String, default: null },
    antiLinkEnabled: { type: Boolean, default: false },
    welcomeChannel: { type: String, default: null },
    leaveChannel: { type: String, default: null },
    welcomeEnabled: { type: Boolean, default: true },
    leaveEnabled: { type: Boolean, default: true },
    applyChannel: { type: String, default: null },
    applyEnabled: { type: Boolean, default: true },
    pollLogChannel: { type: String, default: null }
}, { timestamps: true });

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

// --- NUOVO SCHEMA GET OUT OF JAIL ---
const jailCardSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    lastUsed: { type: Date, required: true }
}, { timestamps: true });

const Setup = mongoose.models.Setup || mongoose.model("Setup", setupSchema);
const Poll = mongoose.models.Poll || mongoose.model("Poll", pollSchema);
const Warn = mongoose.models.Warn || mongoose.model("Warn", warnSchema);
const JailCard = mongoose.models.JailCard || mongoose.model("JailCard", jailCardSchema);

module.exports = { Setup, Poll, Warn, JailCard };
