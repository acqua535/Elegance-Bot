const ticket = require("./ticket");
const games = require("./minigame");

module.exports = {
    // Ticket System
    "ticket_manage": ticket.buttonHandler,
    "claim_ticket": ticket.buttonHandler,
    "close_ticket": ticket.buttonHandler,
    "ping_staff": ticket.buttonHandler,
    "ticket_category": ticket.categoryHandler,

    // Minigame Hub & Games
    "game_quiz": (i) => games.quizGame(i),
    "game_memory": (i) => games.memoryGame(i),
    "game_word": (i) => games.wordGame(i),
    "game_reaction": (i) => games.reactionGame(i),
    "game_hangman": (i) => games.hangmanGame(i),

    // Difficoltà Parola Misteriosa
    "word_easy": (i) => games.startWordGame(i, "facile"),
    "word_medium": (i) => games.startWordGame(i, "medio"),
    "word_hard": (i) => games.startWordGame(i, "difficile")
};
