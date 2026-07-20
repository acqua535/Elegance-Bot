const { EmbedBuilder } = require("discord.js");
const ticket = require("./ticket");
const minigame = require("./minigame");

module.exports = async function buttonHandler(interaction) {
    // Controllo che l'interazione sia un bottone
    if (!interaction.isButton()) return;

    const id = interaction.customId;
    console.log("🔘 Interazione Bottone ricevuta:", id);

    try {
        // 1. VERIFY
        if (id === "verify_button") {
            const verify = require("./verify");
            return await verify.buttonHandler(interaction);
        }

        // 2. RECENSIONI (Il tasto che viene inviato nei DM post-chiusura)
        if (id === "apri_recensione") {
            // Qui richiamerai il tuo futuro comando recensione
            return await interaction.reply({ content: "⭐ Sistema recensioni in fase di attivazione...", ephemeral: true });
        }

        // 3. TICKET (Gestione bottoni diretti)
        // Includiamo anche i nuovi ID: ping_staff, add_user, remove_user, ecc.
        if (id === "claim_ticket" || id === "close_ticket" || id === "save_transcript" || 
            id === "ping_staff" || id === "add_user" || id === "remove_user") {
            return await ticket.buttonHandler(interaction);
        }

        // 4. MINIGAME
        if (id.startsWith("game_")) {
            const game = id.replace("game_", "");
            await interaction.update({
                embeds: [new EmbedBuilder().setTitle("🎮 Minigame avviato").setDescription("La partita sta iniziando...")],
                components: []
            });
            switch (game) {
                case "quiz": return await minigame.quizGame(interaction);
                case "memory": return await minigame.memoryGame(interaction);
                case "word": return await minigame.wordGame(interaction);
                case "reaction": return await minigame.reactionGame(interaction);
                case "hangman": return await minigame.hangmanGame(interaction);
            }
        }

        console.log("⚠️ Bottone non gestito:", id);

    } catch (error) {
        console.error("❌ Errore critico nel buttonHandler:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "❌ Errore nell'elaborazione.", ephemeral: true }).catch(() => {});
        }
    }
};
