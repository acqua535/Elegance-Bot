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
const rolepanel = loadSafe("./rolepanel");
const poll = loadSafe("./poll");

const handleRolePanelInteraction = async (interaction) => {
    const rp = rolepanel.selectMenuHandler ? rolepanel : loadSafe("./rolepanel");
    if (rp && typeof rp.selectMenuHandler === "function") {
        await rp.selectMenuHandler(interaction);
    }
};

const baseRegistry = {
    // --- ROLE PANEL SYSTEM ---
    "select_age_zone": handleRolePanelInteraction,
    "select_ping_zone": handleRolePanelInteraction,
    "select_passions_zone": handleRolePanelInteraction,
    "select_color_zone": handleRolePanelInteraction,

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

    // --- LOG SYSTEM ---
    "log_toggle": logSystem.buttonHandler,
    "log_set_channel": logSystem.buttonHandler,

    // --- ANTI-LINK SYSTEM ---
    "antilink_toggle": antiLink.buttonHandler,
    "antilink_set_channel": antiLink.buttonHandler,

    // --- POLL SYSTEM ---
    "poll_close_early": async (interaction) => {
        if (poll && typeof poll.handlePollInteraction === 'function') {
            await poll.handlePollInteraction(interaction);
        }
    },
    "poll_voters_info": async (interaction) => {
        if (poll && typeof poll.handlePollInteraction === 'function') {
            await poll.handlePollInteraction(interaction);
        }
    }
};

const registryProxy = new Proxy(baseRegistry, {
    get(target, prop) {
        if (prop in target) {
            return target[prop];
        }
        if (typeof prop === "string") {
            if (prop.startsWith("select_") || prop.startsWith("rolepanel_")) {
                return handleRolePanelInteraction;
            }
            if (prop.startsWith("apply_")) {
                if (prop.includes("modal") || prop.includes("form")) {
                    return apply.modalHandler;
                }
                return apply.buttonHandler;
            }
            if (prop.startsWith("poll_")) {
                return async (interaction) => {
                    if (poll && typeof poll.handlePollInteraction === 'function') {
                        await poll.handlePollInteraction(interaction);
                    }
                };
            }
            // --- GESTIONE DINAMICA RECENSIONI (TICKET) ---
            if (prop.startsWith("open_review_modal_")) {
                return ticket.handleReviewButton;
            }
            if (prop.startsWith("submit_review_modal_")) {
                return ticket.handleReviewSubmit;
            }
        }
        return undefined;
    }
});

module.exports = registryProxy;
    
