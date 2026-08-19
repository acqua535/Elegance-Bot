// ==========================================
// FILE: registry.js (PULITO SENZA INVITES)
// ==========================================

function loadSafe(path) {
    try {
        return require(path);
    } catch (e) {
        try {
            return require(`./commands/${path.replace('./', '')}`);
        } catch (err) {
            console.warn(`[REGISTRY] Modulo non trovato: ${path}`);
            return {};
        }
    }
}

const ticket = loadSafe("./ticket");
const verify = loadSafe("./verify");
const entry = loadSafe("./entry");
const apply = loadSafe("./apply");
const logSystem = loadSafe("./logSystem");
const antiLink = loadSafe("./antiLink");
const minigame = loadSafe("./minigame");
const stickyEvents = loadSafe("./stickyEvents");

const registryMap = {
    // --- MINIGAME HUB ---
    "game_hub_select": async (interaction) => {
        if (minigame && typeof minigame.handleGameInteraction === 'function') {
            await minigame.handleGameInteraction(interaction);
        }
    },

    // --- STICKY MESSAGE SYSTEM ---
    "sticky_btn_create": async (interaction) => {
        if (stickyEvents && typeof stickyEvents.handleInteraction === 'function') {
            await stickyEvents.handleInteraction(interaction);
        }
    },
    "sticky_btn_delete": async (interaction) => {
        if (stickyEvents && typeof stickyEvents.handleInteraction === 'function') {
            await stickyEvents.handleInteraction(interaction);
        }
    },
    "sticky_modal_create": async (interaction) => {
        if (stickyEvents && typeof stickyEvents.handleInteraction === 'function') {
            await stickyEvents.handleInteraction(interaction);
        }
    },

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
