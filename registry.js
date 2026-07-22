// ==========================================
// FILE: registry.js
// ==========================================
const ticket = require("./ticket");
const games = require("./minigame");
const verify = require("./verify");
const entry = require("./entry");
const invites = require("./invites");
const apply = require("./apply");

const registryMap = {
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

    // --- VERIFICA / CAPTCHA ---
    "verify_button": verify.buttonHandler,
    "verify_modal": verify.modalHandler,

    // --- BENVENUTO / ADDIO ---
    "entry_toggle_welcome": entry.buttonHandler,
    "entry_toggle_leave": entry.buttonHandler,
    "entry_set_channel": entry.buttonHandler,

    // --- INVITES SYSTEM ---
    "invites_toggle": invites.buttonHandler,
    "invites_set_channel": invites.buttonHandler,

    // --- CANDIDATURE (APPLY) ---
    "apply_toggle": apply.buttonHandler,
    "apply_set_channel": apply.buttonHandler,
    "apply_set_channel_id": apply.buttonHandler,
    "apply_start_button": apply.buttonHandler,
    "apply_accept": apply.buttonHandler,
    "apply_reject": apply.buttonHandler
};

module.exports = async (interaction) => {
    // Intercetta il menu dell'Hub minigiochi prima di cercare nella mappa statica
    if (interaction.isStringSelectMenu() && interaction.customId === 'game_hub_select') {
        return await games.handleGameInteraction(interaction);
    }

    // Cerca il gestore nella mappa statica dei pulsanti/menu
    const handler = registryMap[interaction.customId];
    if (handler) {
        return await handler(interaction);
    }
};
