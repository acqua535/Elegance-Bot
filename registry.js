const ticket = require("./ticket");
const games = require("./minigame");
const verify = require("./verify");
const entry = require("./entry");
const invites = require("./invites");

module.exports = {
    // --- TICKET ---
    "ticket_category": ticket.categoryHandler,
    "ticket_manage": ticket.buttonHandler,
    "claim_ticket": ticket.buttonHandler,
    "close_ticket": ticket.buttonHandler,
    "ping_staff": ticket.buttonHandler,
    
    // --- RATING TICKET ---
    "rate_good": ticket.ratingHandler,
    "rate_mid": ticket.ratingHandler,
    "rate_bad": ticket.ratingHandler,

    // --- GIOCHI ---
    "game_quiz": games.quizGame,
    "game_memory": games.memoryGame,
    "game_word": games.wordGame,
    "game_reaction": games.reactionGame,
    "game_hangman": games.hangmanGame,
    "word_easy": (i) => games.startWordGame(i, "facile"),
    "word_medium": (i) => games.startWordGame(i, "medio"),
    "word_hard": (i) => games.startWordGame(i, "difficile"),

    // --- VERIFICA / CAPTCHA ---
    "verify_button": verify.buttonHandler,
    "verify_modal": verify.modalHandler,

    // --- BENVENUTO / ADDIO ---
    "entry_toggle_welcome": entry.buttonHandler,
    "entry_toggle_leave": entry.buttonHandler,
    "entry_set_channel": entry.buttonHandler,

    // --- INVITES SYSTEM ---
    "invites_toggle": invites.buttonHandler,
    "invites_set_channel": invites.buttonHandler
};
