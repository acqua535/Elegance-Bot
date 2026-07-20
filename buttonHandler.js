const { EmbedBuilder } = require("discord.js");
const ticket = require("./ticket");
const minigame = require("./minigame");

module.exports = async function buttonHandler(interaction) {
    if (!interaction.isButton()) return;

    const id = interaction.customId;
    console.log("🔘 Interazione Bottone ricevuta:", id);

    try {
        // 1. VERIFY
        if (id === "verify_button") {
            const verify = require("./verify");
            return await verify.buttonHandler(interaction);
        }

        // 2. TICKET (Gestione completa: Claim, Ping, Close, Add/Remove User)
        if (["claim_ticket", "ping_staff", "close_ticket", "add_user", "remove_user"].includes(id)) {
            return await ticket.buttonHandler(interaction);
        }

        // 3. MINIGAME
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
