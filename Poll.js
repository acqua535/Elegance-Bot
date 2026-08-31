const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    isMultiple: { type: Boolean, default: false },
    endTime: { type: Number, required: true },
    // Mappa o oggetto per i voti: userId -> array di indici votati [0, 2]
    votes: { type: Map, of: [Number], default: {} },
    ended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Poll || mongoose.model("Poll", pollSchema);
