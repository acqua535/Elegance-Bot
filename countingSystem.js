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
            const expectedNumber = currentNumber + 1;

            // ❌ Errore 1: Ha scritto del testo invece di soli numeri
            if (!/^\d+$/.test(input)) {
                await message.delete().catch(() => {});
                
                // Salviamo il record raggiunto prima del reset
                const oldRecord = currentNumber;
                currentNumber = 0;
                lastUserId = null;

                const failMsg = await message.channel.send(`💥 ${message.author} ha scritto del testo invece di un numero! Il conteggio si è azzerato! Si riparte da **1** (Record raggiunto: **${oldRecord}**).`);
                return;
            }

            const num = parseInt(input, 10);

            // ❌ Errore 2: Ha contato due volte di fila
            if (message.author.id === lastUserId) {
                await message.react("❌").catch(() => {});
                
                const oldRecord = currentNumber;
                currentNumber = 0;
                lastUserId = null;

                await message.channel.send(`💥 ${message.author} ha contato due volte di seguito! Il conteggio si azzera! Si riparte da **1** (Record raggiunto: **${oldRecord}**).`);
                return;
            }

            // ❌ Errore 3: Numero sbagliato
            if (num !== expectedNumber) {
                await message.react("❌").catch(() => {});
                
                const oldRecord = currentNumber;
                currentNumber = 0;
                lastUserId = null;

                await message.channel.send(`💥 ${message.author} ha sbagliato numero (ha scritto **${num}** invece di **${expectedNumber}**)! Il conteggio si azzera! Si riparte da **1** (Record raggiunto: **${oldRecord}**).`);
                return;
            }

            // ✅ SUCCESSO!
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
                const expectedNumber = aiCurrentNumber + 1;

                // ❌ Errore AI 1: Testo invece di numeri
                if (!/^\d+$/.test(content)) {
                    await message.react("❌").catch(() => {});
                    
                    const oldRecord = aiCurrentNumber;
                    aiCurrentNumber = 0;
                    aiLastTurn = null;

                    await message.channel.send(`💥 ${message.author}, hai inviato del testo! La sfida AI si azzera! Si riparte da **1** (Punteggio raggiunto: **${oldRecord}**).`);
                    return;
                }

                const num = parseInt(content, 10);

                // ❌ Errore AI 2: L'utente scrive due numeri di fila prima dell'AI
                if (aiLastTurn === "user") {
                    await message.react("❌").catch(() => {});
                    
                    const oldRecord = aiCurrentNumber;
                    aiCurrentNumber = 0;
                    aiLastTurn = null;

                    await message.channel.send(`💥 ${message.author}, non hai aspettato l'AI! Conteggio azzerato! Si riparte da **1** (Punteggio raggiunto: **${oldRecord}**).`);
                    return;
                }

                // ❌ Errore AI 3: Numero sbagliato
                if (num !== expectedNumber) {
                    await message.react("❌").catch(() => {});
                    
                    const oldRecord = aiCurrentNumber;
                    aiCurrentNumber = 0;
                    aiLastTurn = null;

                    await message.channel.send(`💥 ${message.author}, numero errato! Volevo **${expectedNumber}** ma hai scritto **${num}**. Conteggio azzerato! Si riparte da **1** (Punteggio raggiunto: **${oldRecord}**).`);
                    return;
                }

                // ✅ Numero utente valido!
                aiCurrentNumber = expectedNumber;
                aiLastTurn = "user";
                await message.react("✅").catch(() => {});

                // Risposta automatica dell'AI dopo 1 secondo
                setTimeout(async () => {
                    aiCurrentNumber += 1;
                    aiLastTurn = "bot";
                    await message.channel.send(`${aiCurrentNumber}`);
                }, 1000);
            }
        }
    });
};
