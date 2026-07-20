const ticket = require("./ticket");
const games = require("./minigame");

module.exports = {
    // Ticket
    "ticket_category": ticket.categoryHandler,
    "ticket_manage": ticket.buttonHandler,
    "claim_ticket": ticket.buttonHandler,
    "close_ticket": ticket.buttonHandler,
    "ping_staff": ticket.buttonHandler,
    
    // Giochi
    "game_quiz": games.quizGame,
    "game_memory": games.memoryGame,
    "game_word": games.wordGame,
    "game_reaction": games.reactionGame,
    "game_hangman": games.hangmanGame,
    "word_easy": (i) => games.startWordGame(i, "facile"),
    "word_medium": (i) => games.startWordGame(i, "medio"),
    "word_hard": (i) => games.startWordGame(i, "difficile")
};
