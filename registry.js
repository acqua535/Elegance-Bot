const ticket = require("./ticket");
const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'commands', 'verify.js');
console.log("--> ESISTE IL FILE?", fs.existsSync(targetPath));

const verify = require("./commands/verify");
const entry = require("./commands/entry");
console.log("--> CARICAMENTO REGISTRY DA:", __filename);
const apply = require("./commands/apply");
const logSystem = require("./commands/logSystem");
const antiLink = require("./antiLink");

const registryMap = {
    // --- TICKET ---
    "ticket_category": ticket.categoryHandler,
    "ticket_manage_menu": ticket.manageMenuHandler,
    "ticket_transfer_select": ticket.transferHandler,
    "ticket_modal_adduser": ticket.modalHandler,
    "ticket_modal_removeuser": ticket.modalHandler,
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
    "apply_reject": apply.buttonHandler,

    // --- LOG SYSTEM ---
    "log_toggle": logSystem.buttonHandler,
    "log_set_channel": logSystem.buttonHandler,

    // --- ANTI-LINK SYSTEM ---
    "antilink_toggle": antiLink.buttonHandler,
    "antilink_set_channel": antiLink.buttonHandler
};

module.exports = registryMap;
