const { EmbedBuilder } = require("discord.js");

// 📌 STATO DEL COUNTING GLOBALE
let countingChannelId = null;
let currentNumber = 0;
let lastUserId = null;

// 📌 STATO PER IL COUNTING AI (Canale dedicato)
const AI_CHANNEL_ID = "1529276659067523155";
let aiSessionActive = false;
let aiCurrentNumber = 0;
let aiLastTurn = null; // 'user' o 'bot'

module.exports = (client) => {
    // Esportiamo la funzione per impostare il canale da /counting setup
    client.setCountingChannel = (channelId) => {
        countingChannelId = channelId;
        currentNumber = 0;
        lastUserId = null;
    };

    client.on("messageCreate", async (message) => {
        if (message.author.bot || !message.guild) return;

        // ==========================================
        // 🎮 1. LOGICA COUNTING GLOBALE (MULTI-UTENTE)
        // ==========================================
        if (countingChannelId && message.channel.id === countingChannelId) {
            const input = message.content.trim();

            // Controllo: deve contenere SOLO cifre
            if (!/^\d+$/.test(input)) {
                await message.delete().catch(() => {});
                return;
            }

            const num = parseInt(input, 10);
            const expectedNumber = currentNumber + 1;

            // Se l'utente scrive due volte di seguito
            if (message.author.id === lastUserId) {
                await message.delete().catch(() => {});
                const warningMsg = await message.channel.send(`⚠️ ${message.author}, non puoi contare due volte di fila! Lascia fare ad un altro utente.`);
                setTimeout(() => warningMsg.delete().catch(() => {}), 4000);
                return;
            }

            // Se il numero è sbagliato
            if (num !== expectedNumber) {
                await message.delete().catch(() => {});
                const warningMsg = await message.channel.send(`❌ Numero errato, ${message.author}! Il prossimo numero da inserire è **${expectedNumber}**.`);
                setTimeout(() => warningMsg.delete().catch(() => {}), 4000);
                return;
            }

            // Successo! Aggiorniamo il punteggio
            currentNumber = expectedNumber;
            lastUserId = message.author.id;
            await message.react("✅").catch(() => {});
            return;
        }

        // ==========================================
        // 🤖 2. LOGICA COUNTING AI (CANALE DEDICATO)
        // ==========================================
        if (message.channel.id === AI_CHANNEL_ID) {
            const content = message.content.trim().toLowerCase();

            // Comando di avvio/cancellazione via testo nel canale AI
            if (content === "inizia") {
                if (aiSessionActive) {
                    return message.reply("⚠️ **Errore:** C'è già un Counting AI in corso qui! Termina questo o digita `cancella` per ricominciare.");
                }
                aiSessionActive = true;
                aiCurrentNumber = 0;
                aiLastTurn = null;

                const embed = new EmbedBuilder()
                    .setTitle("🤖 Counting AI Avviato!")
                    .setColor(0x57F287)
                    .setDescription("Ho resettato il conteggio! Tocca a te iniziare digitando **1** (Solo numeri consentiti!).")
                    .setFooter({ text: "Scrivi 'cancella' in qualsiasi momento per fermare la sessione." });

                return message.channel.send({ embeds: [embed] });
            }

            if (content === "cancella") {
                if (!aiSessionActive) {
                    return message.reply("ℹ️ Non c'è nessuna sessione AI attiva da cancellare.");
                }
                aiSessionActive = false;
                aiCurrentNumber = 0;
                aiLastTurn = null;

                const embed = new EmbedBuilder()
                    .setTitle("🛑 Counting AI Annullato")
                    .setColor(0xED4245)
                    .setDescription("La sessione AI è stata cancellata con successo. Digita `inizia` per crearne una nuova!");

                return message.channel.send({ embeds: [embed] });
            }

            // Se la sessione AI è attiva, gestiamo i numeri
            if (aiSessionActive) {
                // Controllo: deve contenere SOLO cifre
                if (!/^\d+$/.test(content)) {
                    await message.delete().catch(() => {});
                    return;
                }

                const num = parseInt(content, 10);
                const expectedNumber = aiCurrentNumber + 1;

                if (aiLastTurn === "user") {
                    await message.delete().catch(() => {});
                    const warningMsg = await message.channel.send(`⚠️ ${message.author}, attendi che la risposta dell'AI prima di inviare un altro numero!`);
                    setTimeout(() => warningMsg.delete().catch(() => {}), 4000);
                    return;
                }

                if (num !== expectedNumber) {
                    await message.delete().catch(() => {});
                    const warningMsg = await message.channel.send(`❌ Numero sbagliato! Devi inserire **${expectedNumber}**.`);
                    setTimeout(() => warningMsg.delete().catch(() => {}), 4000);
                    return;
                }

                // Numero utente valido!
                aiCurrentNumber = expectedNumber;
                aiLastTurn = "user";
                await message.react("✅").catch(() => {});

                // Il bot risponde subito con il numero successivo
                setTimeout(async () => {
                    aiCurrentNumber += 1;
                    aiLastTurn = "bot";
                    await message.channel.send(`${aiCurrentNumber}`);
                }, 1000);
            }
        }
    });
};
          
