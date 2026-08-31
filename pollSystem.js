const { Poll } = require("./Setup");

async function handlePollInteraction(interaction) {
    const customId = interaction.customId;
    const messageId = interaction.message.id;

    const poll = await Poll.findOne({ messageId });
    if (!poll) {
        return interaction.reply({ content: "❌ Questo sondaggio è scaduto o non esiste più nel database.", ephemeral: true });
    }

    if (poll.ended) {
        return interaction.reply({ content: "❌ Questo sondaggio è già terminato.", ephemeral: true });
    }

    // Chiusura anticipata (solo per chi ha i permessi di gestione messaggi)
    if (customId === "poll_close_early") {
        if (!interaction.member.permissions.has("ManageMessages")) {
            return interaction.reply({ content: "❌ Solo i membri con permessi di gestione messaggi possono chiudere il sondaggio in anticipo.", ephemeral: true });
        }
        await interaction.deferUpdate();
        const { chiudiSondaggio } = require("./poll");
        await chiudiSondaggio(interaction.client, messageId);
        return;
    }

    // Visualizza chi ha votato (visibile solo in privato / ephemeral)
    if (customId === "poll_voters_info") {
        let infoText = "👥 **Elenco dei partecipanti:**\n\n";
        if (poll.votes.size === 0) {
            infoText += "Nessun voto registrato finora.";
        } else {
            poll.votes.forEach((indices, userId) => {
                const choices = indices.map(idx => `${["1️⃣", "2️⃣", "3️⃣", "4️⃣"][idx]}`).join(", ");
                infoText += `• <@${userId}> ha votato: ${choices}\n`;
            });
        }
        return interaction.reply({ content: infoText, ephemeral: true });
    }

    // Gestione del voto numerico
    if (customId.startsWith("poll_vote_")) {
        const optionIndex = parseInt(customId.split("_")[2]);
        const userId = interaction.user.id;

        let userVotes = poll.votes.get(userId) || [];

        if (poll.isMultiple) {
            if (userVotes.includes(optionIndex)) {
                userVotes = userVotes.filter(i => i !== optionIndex);
            } else {
                userVotes.push(optionIndex);
            }
        } else {
            if (userVotes.includes(optionIndex)) {
                userVotes = [];
            } else {
                userVotes = [optionIndex];
            }
        }

        if (userVotes.length > 0) {
            poll.votes.set(userId, userVotes);
        } else {
            poll.votes.delete(userId);
        }

        await poll.save();

        return interaction.reply({ 
            content: userVotes.length > 0 
                ? `✅ Il tuo voto è stato registrato/aggiornato con successo! (Opzioni scelte: ${userVotes.map(i => `${["1️⃣", "2️⃣", "3️⃣", "4️⃣"][i]}`).join(", ")})` 
                : `❌ Hai rimosso il tuo voto da questo sondaggio.`, 
            ephemeral: true 
        });
    }
}

module.exports = { handlePollInteraction };
