const fs = require('fs');
const path = require('path');

// Mappa la struttura dei file per debug
console.log("📂 FILE NELLA ROOT:", fs.readdirSync(__dirname));
const items = fs.readdirSync(__dirname);
items.forEach(item => {
    const fullPath = path.join(__dirname, item);
    if (fs.statSync(fullPath).isDirectory() && item !== 'node_modules' && !item.startsWith('.')) {
        console.log(`📁 CONTENUTO DI '${item}':`, fs.readdirSync(fullPath));
    }
});

// Funzione intelligente per caricare i moduli ovunque si trovino
function safeRequire(fileName) {
    const possiblePaths = [
        `./${fileName}`,
        `./commands/${fileName}`,
        `./src/${fileName}`,
        `./handlers/${fileName}`
    ];

    for (const p of possiblePaths) {
        try {
            const mod = require(p);
            console.log(`✅ MODULO CARICATO: ${fileName} (da '${p}')`);
            return mod;
        } catch (err) {
            // Se l'errore NON è "file non trovato", significa che c'è un errore di sintassi dentro il file stesso!
            if (err.code !== 'MODULE_NOT_FOUND' || !err.message.includes(p)) {
                console.log(`❌ ERRORE DI CODICE IN ${fileName} ('${p}'):`, err.message);
                return {};
            }
        }
    }
    console.log(`⚠️ IMPOSSIBILE TROVARE IL FILE: ${fileName}`);
    return {};
}

// Caricamento sicuro dei moduli
const ticket = safeRequire("ticket");
const verify = safeRequire("verify");
const entry = safeRequire("entry");
const invites = safeRequire("invites");
const apply = safeRequire("apply");
const logSystem = safeRequire("logSystem");
const antiLink = safeRequire("antiLink");

// Registro completo di tutti i bottoni e interazioni
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
