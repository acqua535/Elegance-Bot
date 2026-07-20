const { EmbedBuilder } = require("discord.js");
const ticket = require("./ticket");
const minigame = require("./minigame");

module.exports = async function buttonHandler(interaction) {
    // Controllo che l'interazione sia un bottone o un menu
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) {
        return;
    }

    const id = interaction.customId;
    console.log("🔘 Interazione ricevuta:", id);

    try {
        // ===============================
        // 1. VERIFY (Pulsante di Verifica)
        // ===============================
        if (interaction.isButton() && id === "verify_button") {
            try {
                // Prova a caricare dalla root, se fallisce prova da commands
                const verify = require("./verify");
                return await verify.buttonHandler(interaction);
            } catch (e) {
                const verify = require("./commands/verify");
                return await verify.buttonHandler(interaction);
            }
        }

        // ===============================
        // 2. TICKET (Gestione completa)
        // ===============================
        // Include: claim, close, rate_*, ticket_rate*
        if (interaction.isButton() && (
            id === "claim_ticket" || 
            id === "close_ticket" || 
            id.startsWith("rate_") || 
            id.startsWith("ticket_rate")
        )) {
            return await ticket.buttonHandler(interaction);
        }

        // Gestione Menu Selezione Ticket
        if (interaction.isStringSelectMenu() && (
            id === "ticket_manage" || 
            id === "ticket_category" || 
            id === "ticket_priority"
        )) {
            return await ticket.router(interaction);
        }

        // ===============================
        // 3. MINIGAME (Sistema giochi)
        // ===============================
        if (interaction.isButton() && id.startsWith("game_")) {
            const game = id.replace("game_", "");
            
            // Messaggio di avvio pulito
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🎮 Minigame avviato")
                        .setDescription("La partita sta iniziando, attendi un istante...")
                        .setColor("Blue")
                ],
                components: []
            });

            switch (game) {
                case "quiz": return await minigame.quizGame(interaction);
                case "memory": return await minigame.memoryGame(interaction);
                case "word": return await minigame.wordGame(interaction);
                case "reaction": return await minigame.reactionGame(interaction);
                case "hangman": return await minigame.hangmanGame(interaction);
                default: 
                    return await interaction.followUp({ content: "❌ Minigame non trovato.", ephemeral: true });
            }
        }

        // ===============================
        // 4. GESTIONE ERRORI / ID SCONOSCIUTI
        // ===============================
        console.log("⚠️ Bottone non gestito:", id);
        
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "⚠️ Questa interazione non è configurata.",
                ephemeral: true
            }).catch(() => {});
        }

    } catch (error) {
        console.error("❌ Errore critico nel buttonHandler:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "❌ Si è verificato un errore nell'elaborazione del comando.",
                ephemeral: true
            }).catch(() => {});
        }
    }
};
