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

// --- SCHEMA PER I WARN ---
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

// Questo controlla se i modelli esistono già nella connessione attiva, evitando il crash
const Setup = mongoose.models.Setup || mongoose.model("Setup", setupSchema);
const Poll = mongoose.models.Poll || mongoose.model("Poll", pollSchema);
const Warn = mongoose.models.Warn || mongoose.model("Warn", warnSchema);

// UNICO EXPORT FINALE CON TUTTI E TRE
module.exports = { Setup, Poll, Warn };
