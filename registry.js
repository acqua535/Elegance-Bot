// ==========================================
// FILE: registry.js
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
const rolepanel = loadSafe("./rolepanel");
const poll = loadSafe("./poll");

const handleRolePanelInteraction = async (interaction) => {
    const rp = rolepanel.selectMenuHandler ? rolepanel : loadSafe("./rolepanel");
    if (rp && typeof rp.selectMenuHandler === "function") {
        await rp.selectMenuHandler(interaction);
    }
};

const handlePollInteraction = async (interaction) => {
    const pl = poll && typeof poll.handlePollInteraction === 'function' ? poll : loadSafe("./poll");
    if (pl && typeof pl.handlePollInteraction === 'function') {
        await pl.handlePollInteraction(interaction);
    }
};

const handleReviewBtn = async (interaction) => {
    const tk = ticket && typeof ticket.handleReviewButton === 'function' ? ticket : loadSafe("./ticket");
    if (tk && typeof tk.handleReviewButton === 'function') {
        await tk.handleReviewButton(interaction);
    }
};

const handleReviewSub = async (interaction) => {
    const tk = ticket && typeof ticket.handleReviewSubmit === 'function' ? ticket : loadSafe("./ticket");
    if (tk && typeof tk.handleReviewSubmit === 'function') {
        await tk.handleReviewSubmit(interaction);
    }
};

const handleJailCardInteraction = async (interaction) => {
    const ent = entry && typeof entry.handleJailCard === 'function' ? entry : loadSafe("./entry");
    if (ent && typeof ent.handleJailCard === 'function') {
        await ent.handleJailCard(interaction);
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

    // --- TICKET & RECENSIONI ---
    "ticket_category": ticket.categoryHandler,
    "ticket_manage_menu": ticket.manageMenuHandler,
    "ticket_transfer_select": ticket.transferHandler,
    "ticket_modal_adduser": ticket.modalHandler,
    "ticket_modal_removeuser": ticket.modalHandler,
    
    "open_review_modal": handleReviewBtn,
    "submit_review_public": handleReviewSub,

    // --- VERIFICA / CAPTCHA ---
    "verify_button": verify.buttonHandler,
    "verify_modal": verify.modalHandler,

    // --- BENVENUTO / ADDIO / JAIL CARD ---
    "entry_toggle_welcome": entry.buttonHandler,
    "entry_toggle_leave": entry.buttonHandler,
    "entry_set_channel": entry.buttonHandler,
    "use_jail_card": handleJailCardInteraction,

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
    "poll_close_early": handlePollInteraction,
    "poll_voters_info": handlePollInteraction
};

const registryProxy = new Proxy(baseRegistry, {
    // Intercetta la verifica d'esistenza (es. 'use_jail_card' in registry)
    has(target, prop) {
        if (typeof prop === "string") {
            if (
                prop === "use_jail_card" || 
                prop.startsWith("use_jail_card") ||
                prop.startsWith("open_review_") ||
                prop.startsWith("submit_review_") ||
                prop.startsWith("select_") ||
                prop.startsWith("rolepanel_") ||
                prop.startsWith("apply_") ||
                prop.startsWith("poll_")
            ) {
                return true;
            }
        }
        return prop in target;
    },

    // Intercetta il recupero dell'handler
    get(target, prop) {
        if (prop === "use_jail_card") return handleJailCardInteraction;
        if (prop === "open_review_modal") return handleReviewBtn;
        if (prop === "submit_review_public") return handleReviewSub;

        if (typeof prop === "string") {
            if (prop === "use_jail_card" || prop.startsWith("use_jail_card")) {
                return handleJailCardInteraction;
            }
            if (prop.startsWith("open_review_modal") || prop.startsWith("open_review_dm_")) {
                return handleReviewBtn;
            }
            if (prop.startsWith("submit_review_modal") || prop.startsWith("submit_review_")) {
                return handleReviewSub;
            }
        }

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
                return handlePollInteraction;
            }
        }
        return undefined;
    }
});

module.exports = registryProxy;
