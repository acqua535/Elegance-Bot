module.exports = {
    // ID bottone: funzione da eseguire
    "claim_ticket": require("./ticket").buttonHandler,
    "close_ticket": require("./ticket").buttonHandler,
    "ping_staff": require("./ticket").buttonHandler,
    // Domani aggiungerai: "verify_button": require("./verify").execute,
};
