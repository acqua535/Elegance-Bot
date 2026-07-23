// ==========================================
// FILE: registry.js (MAPPA COMPLETA)
// ==========================================
const ticket = require("./ticket");
const verify = require("./verify");
const entry = require("./entry");
const invites = require("./invites");
const apply = require("./apply");

const registryMap = {
    // --- TICKET: SELETTORI & MENU A TENDINA ---
    "ticket_category": ticket.categoryHandler,
    "ticket_manage_menu": ticket.manageMenuHandler,
    "ticket_transfer_select": ticket.transferHandler,

    // --- TICKET: MODALI (Aggiungi / Rimuovi Utente) ---
    "ticket_modal_adduser": ticket.modalHandler,
    "ticket_modal_removeuser": ticket.modalHandler,

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

module.exports = registryMap;
