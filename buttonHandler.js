const { EmbedBuilder } = require("discord.js");
const ticket = require("./ticket");
const minigame = require("./minigame");
const horrorEngine = require("./horrorEngine");

module.exports = async function buttonHandler(interaction){
    if(!interaction.isButton() && !interaction.isStringSelectMenu()){ return; }
    const id = interaction.customId;
    console.log("🔘 Interazione ricevuta:", id);

    try {
        // VERIFY - Caricamento dinamico ultra-sicuro
        if(interaction.isButton() && id === "verify_button"){
            try {
                const verify = require("./verify"); // Cerca in root
                return verify.buttonHandler(interaction);
            } catch (e) {
                const verify = require("./commands/verify"); // Se non trova in root, prova in commands
                return verify.buttonHandler(interaction);
            }
        }

        // TICKET BUTTONS - Con il fix della recensione
        if(interaction.isButton() && (id === "claim_ticket" || id === "close_ticket" || id.startsWith("rate_") || id.startsWith("ticket_rate"))){
            return ticket.buttonHandler(interaction);
        }

        // ... resto del codice identico a prima ...
        if(interaction.isButton() && id.startsWith("horror_start_")){
            const storyId = Number(id.replace("horror_start_", ""));
            return horrorEngine.startStory(interaction, storyId);
        }

        if(interaction.isButton() && (id === "horror_inventory" || id === "horror_restart" || id.startsWith("horror_"))){
            return horrorEngine.buttonHandler(interaction);
        }

        if(interaction.isStringSelectMenu() && id === "ticket_manage"){
            return ticket.router(interaction);
        }

        if(id === "word_easy" || id === "word_medium" || id === "word_hard"){
            const difficulty = id === "word_easy" ? "facile" : id === "word_medium" ? "medio" : "difficile";
            await interaction.update({ content: `🔤 Modalità ${difficulty} selezionata!`, embeds:[], components:[] });
            return minigame.startWordGame(interaction, difficulty);
        }

        if(interaction.isButton() && id.startsWith("game_")){
            const game = id.replace("game_", "");
            await interaction.update({ embeds:[ new EmbedBuilder().setTitle("🎮 Minigame avviato").setDescription("La partita sta iniziando...") ], components:[] });
            switch(game){
                case "quiz": return minigame.quizGame(interaction);
                case "memory": return minigame.memoryGame(interaction);
                case "word": return minigame.wordGame(interaction);
                case "reaction": return minigame.reactionGame(interaction);
                case "hangman": return minigame.hangmanGame(interaction);
                default: return interaction.followUp({ content: "❌ Minigame non trovato.", ephemeral:true });
            }
        }

        console.log("⚠️ Bottone non gestito:", id);
        if(!interaction.replied && !interaction.deferred){
            await interaction.reply({ content: "⚠️ Questo bottone non è configurato.", ephemeral:true }).catch(()=>{});
        }
    } catch(error){
        console.error("❌ Errore ButtonHandler:", error);
    }
};
