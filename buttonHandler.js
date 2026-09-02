// ==========================================
// FILE: buttonHandler.js (SUPER LOG DI DEBUG + RECENSIONI + JAIL CARD)
// ==========================================
const { EmbedBuilder, MessageFlags } = require('discord.js');
const registryMap = require('./registry');

const loadSafe = (path) => {
    try { return require(path); } catch (e) { return {}; }
};

module.exports = async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    console.log(`[BUTTON-HANDLER] 📥 Ricevuta interazione customId: "${customId}" da @${interaction.user.tag}`);

    // ---------------------------------------------------------
    // 0. GESTIONE DIRETTA STICKY SYSTEM
    // ---------------------------------------------------------
    if (customId.startsWith('sticky_btn_') || customId.startsWith('sticky_modal_')) {
        console.log(`[BUTTON-HANDLER] 📌 Intercettata azione Sticky: "${customId}"`);
        try {
            const stickyEvents = require('./stickyEvents');
            if (stickyEvents && typeof stickyEvents.handleInteraction === 'function') {
                console.log(`[BUTTON-HANDLER] ➡️ Chiamata a stickyEvents.handleInteraction()...`);
                return await stickyEvents.handleInteraction(interaction);
            } else {
                console.error(`[BUTTON-HANDLER] ❌ stickyEvents.handleInteraction NON TROVATO!`);
            }
        } catch (err) {
            console.error(`[BUTTON-HANDLER] 🚨 ERRORE IMPREVISTO IN CARICAMENTO STICKY:`, err);
        }
    }

    // ---------------------------------------------------------
    // 0.1 GESTIONE DINAMICA RECENSIONI (TICKET)
    // ---------------------------------------------------------
    if (customId.startsWith('open_review_modal_') || customId.startsWith('submit_review_modal_')) {
        console.log(`[BUTTON-HANDLER] ⭐ Intercettata azione Recensione: "${customId}"`);
        try {
            const ticketModule = loadSafe('./ticket');
            if (customId.startsWith('open_review_modal_') && typeof ticketModule.handleReviewButton === 'function') {
                return await ticketModule.handleReviewButton(interaction);
            }
            if (customId.startsWith('submit_review_modal_') && typeof ticketModule.handleReviewSubmit === 'function') {
                return await ticketModule.handleReviewSubmit(interaction);
            }
        } catch (err) {
            console.error(`[BUTTON-HANDLER] 🚨 ERRORE NELLA GESTIONE DELLA RECENSIONE:`, err);
        }
    }

    // ---------------------------------------------------------
    // 0.2 GESTIONE CARTA GET OUT OF JAIL FREE
    // ---------------------------------------------------------
    if (customId === 'use_jail_card') {
        console.log(`[BUTTON-HANDLER] 🃏 Intercettato utilizzo Get Out of Jail Card da @${interaction.user.tag}`);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

        try {
            const { JailCard } = require('./Setup');
            const userId = interaction.user.id;
            const now = new Date();

            // 1. Controllo Cooldown su MongoDB (24 ore)
            let userCard = await JailCard.findOne({ userId });

            if (userCard) {
                const lastUsed = new Date(userCard.lastUsed).getTime();
                const cooldown = 24 * 60 * 60 * 1000;
                const timePassed = now.getTime() - lastUsed;

                if (timePassed < cooldown) {
                    const timeLeft = cooldown - timePassed;
                    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                    return await interaction.editReply({
                        content: `⏳ **Cooldown Attivo:** Hai già usato la carta di recente. Potrai riutilizzarla tra **${hoursLeft}h e ${minutesLeft}m**.`
                    });
                }
            }

            // 2. Recupero del Server (gestisce anche l'esecuzione da DM)
            const guild = interaction.guild 
                || await interaction.client.guilds.fetch("1528576030783176835").catch(() => null) 
                || interaction.client.guilds.cache.first();

            if (!guild) {
                return await interaction.editReply({ content: "❌ Impossibile reperire le informazioni del server." });
            }

            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) {
                return await interaction.editReply({ content: "❌ Non risulti essere presente nel server Elegance Sponsoring." });
            }

            // 3. Verifica presenza Timeout attivo
            if (!member.isCommunicationDisabled()) {
                return await interaction.editReply({
                    content: "🛡️ **Nessun Timeout attivo!** Non hai alcun Timeout da rimuovere al momento. Conserva la tua carta per quando ne avrai bisogno."
                });
            }

            // 4. Esecuzione istantanea: rimozione Timeout
            await member.timeout(null, "Rimozione tramite Get Out of Jail Free Card (DM)");

            // 5. Salvataggio Timestamp su MongoDB per Cooldown Persistente
            if (userCard) {
                userCard.lastUsed = now;
                await userCard.save();
            } else {
                await JailCard.create({ userId, lastUsed: now });
            }

            const successEmbed = new EmbedBuilder()
                .setTitle("🃏 CARTA GIOCATA CON SUCCESSO")
                .setDescription("✅ Il tuo Timeout nel server è stato rimosso istantaneamente!\n\n*Nota: la carta entra ora in cooldown per 24 ore.*")
                .setColor(0x00FF00)
                .setTimestamp();

            return await interaction.editReply({ embeds: [successEmbed] });

        } catch (err) {
            console.error("[BUTTON-HANDLER 🚨 ERRORE JAIL CARD]", err);
            return await interaction.editReply({ content: "❌ Si è verificato un errore imprevisto durante l'esecuzione della carta." });
        }
    }

    // ---------------------------------------------------------
    // 1. GESTIONE MINIGIOCHI
    // ---------------------------------------------------------
    if (interaction.isStringSelectMenu() && customId === 'game_hub_select') {
        console.log(`[BUTTON-HANDLER] 🎮 Menu Minigiochi game_hub_select`);
        const minigameCmd = interaction.client.commands.get('minigame');
        if (minigameCmd && typeof minigameCmd.handleGameInteraction === 'function') {
            return await minigameCmd.handleGameInteraction(interaction);
        }
    }

    const minigamePrefixes = ['quiz_', 'bomb_', 'mem_', 'react_', 'hangman_'];
    if (minigamePrefixes.some(prefix => customId.startsWith(prefix))) {
        console.log(`[BUTTON-HANDLER] 🎮 Interazione interna gioco (${customId}), gestita da Collector.`);
        return; 
    }

    // ---------------------------------------------------------
    // 2. REGISTRY MAP
    // ---------------------------------------------------------
    const handler = registryMap[customId];

    if (!handler) {
        console.warn(`[BUTTON-HANDLER] ⚠️ Nessun handler trovato nel Registry per: "${customId}"`);

        if (interaction.isButton()) {
            if (customId.startsWith("apply_accept_") || customId.startsWith("apply_reject_")) {
                console.log(`[BUTTON-HANDLER] Candidatura dinamica per: ${customId}`);
                const apply = require("./apply");
                return await apply.buttonHandler(interaction);
            }
        }

        if (!interaction.replied && !interaction.deferred) {
            console.log(`[BUTTON-HANDLER] ❌ Invio risposta 'Azione non riconosciuta' per: "${customId}"`);
            return interaction.reply({
                content: "❌ **Azione non riconosciuta o interazione scaduta.**",
                flags: MessageFlags.Ephemeral
            }).catch(() => {});
        }
        return;
    }

    try {
        console.log(`[BUTTON-HANDLER] ⚙️ Esecuzione handler da Registry per: "${customId}"`);
        await handler(interaction);
    } catch (error) {
        console.error(`🚨 Errore durante l'esecuzione dell'interazione [${customId}]:`, error);
        const errorMessage = "❌ Si è verificato un errore durante l'esecuzione dell'azione.";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
};
        
