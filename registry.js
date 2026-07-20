const ticket = require("./ticket");

module.exports = {
    // Gestione del menu di apertura (Categorie)
    "ticket_category": ticket.categoryHandler,
    
    // Gestione del menu di gestione ticket (dentro il canale)
    "ticket_manage": ticket.buttonHandler,
    
    // Gestione dei valori (se il bottone/menu passa il value invece dell'ID)
    "claim_ticket": ticket.buttonHandler,
    "close_ticket": ticket.buttonHandler,
    "ping_staff": ticket.buttonHandler,
};
