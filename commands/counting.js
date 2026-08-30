// ==========================================
// FILE: counting.js (VERSIONE BASE ORIGINALE + MONGOOSE)
// ==========================================
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");
const Setup = require("./Setup");

const AI_CHANNEL_ID = "1529276659067523155";

// Helper salvataggio MongoDB per il Counting
const saveCountingSetup = async (guildId, data) => {
    try {
        const updateData = {};
        if (data.countingChannel !== undefined) updateData.countingChannel = data.countingChannel;
        if (data.aiEnabled !== undefined) updateData.countingAiEnabled = data.aiEnabled;
        if (data.currentNumber !== undefined) updateData.countingCurrentNumber = data.currentNumber;
        if (data.lastUserId !== undefined) updateData.countingLastUserId = data.lastUserId;

        return await Setup.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { upsert: true, new: true }
        );
    } catch (e) {
        console.error("[MONGO ERROR] Errore salvataggio Counting:", e);
        return null;
    }
};

// Helper lettura MongoDB per il Counting
const getGuildCountingConfig = async (guildId) => {
    if (!guildId) return { countingChannel: null, aiEnabled: false, currentNumber: 0, lastUserId: null };
    try {
        let setup = await Setup.findOne({ guildId });
        if (!setup) {
            setup = await Setup.create({ 
                guildId, 
                countingChannel: null, 
                countingAiEnabled: false, 
                countingCurrentNumber: 0, 
                countingLastUserId: null 
            });
        }
        return {
            countingChannel: setup.countingChannel || null,
            aiEnabled: setup.countingAiEnabled ?? false,
            currentNumber: setup.countingCurrentNumber ?? 0,
            lastUserId: setup.countingLastUserId || null
        };
    } catch (e) {
        console.error("[MONGO ERROR] Errore lettura Counting:", e);
        return { countingChannel: null, aiEnabled: false, currentNumber: 0, lastUserId: null };
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("counting")
        .setDescription("Gestione del sistema di Counting")
        .addSubcommand(subcommand =>
            subcommand
                .setName("setup")
                .setDescription("Imposta il canale per il Counting globale del server")
                .addChannelOption(option =>
                    option
                        .setName("canale")
                        .setDescription("Seleziona il canale dove attivare il Counting")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("ai")
                .setDescription("Attiva il supporto AI per contare da solo")
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        // 📌 SUBCOMMAND: /counting setup
        if (subcommand === "setup") {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ 
                    content: "❌ Devi essere un **Amministratore** per configurare il canale di Counting.", 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const targetChannel = interaction.options.getChannel("canale");

            // Salvataggio su MongoDB Cloud
            await saveCountingSetup(guildId, { countingChannel: targetChannel.id });

            if (interaction.client.setCountingChannel) {
                interaction.client.setCountingChannel(targetChannel.id);
            }

            const embed = new EmbedBuilder()
                .setTitle("🔢 Canale Counting Configurato!")
                .setColor(0x57F287)
                .setDescription(`Il gioco del Counting è ora attivo in ${targetChannel}!\n\n**Regole:**\n- Si parte da **1** (o si continua dal numero precedente).\n- Se scrivi del testo, il numero deve essere all'inizio.\n- Un utente non può inviare due numeri di fila.`)
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] }).catch(() => {});
            return interaction.reply({ 
                content: `✅ Canale impostato e salvato su MongoDB Cloud in ${targetChannel}!`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 📌 SUBCOMMAND: /counting ai
        if (subcommand === "ai") {
            if (interaction.channelId !== AI_CHANNEL_ID) {
                return interaction.reply({
                    content: `❌ Questo comando può essere utilizzato esclusivamente nel canale dedicato: <#${AI_CHANNEL_ID}>!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await saveCountingSetup(guildId, { aiEnabled: true });

            const embed = new EmbedBuilder()
                .setTitle("🤖 Modalità Counting AI")
                .setColor(0x5865F2)
                .setDescription("Vuoi contare da solo in coppia con me?\n\n- Scrivi **`inizia`** se vuoi che inizi ad aiutarti a contare partendo da 1.\n- Scrivi **`cancella`** se vuoi cancellare il supporto dell'AI e resettare la sessione.")
                .setFooter({ text: "Ricorda: solo numeri consentiti durante la partita!" });

            return interaction.reply({ embeds: [embed] });
        }
    },

    // 🛡️ Gestione Eventi Messaggi del Counting esatto come lo volevi
    initEvents(client) {
        client.on("messageCreate", async (message) => {
            try {
                if (!message.guild || message.author.bot) return;

                const config = await getGuildCountingConfig(message.guild.id);
                if (!config.countingChannel || message.channel.id !== config.countingChannel) return;

                const content = message.content.trim();
                if (!content) return;

                // Gestione comandi AI se siamo nel canale dedicato e l'AI è attiva
                if (message.channel.id === AI_CHANNEL_ID && config.aiEnabled) {
                    if (content.toLowerCase() === "inizia") {
                        const nextNum = 1;
                        await saveCountingSetup(message.guild.id, {
                            currentNumber: nextNum,
                            lastUserId: client.user.id
                        });
                        return message.channel.send(nextNum.toString());
                    }
                    if (content.toLowerCase() === "cancella") {
                        await saveCountingSetup(message.guild.id, {
                            currentNumber: 0,
                            lastUserId: null,
                            aiEnabled: false
                        });
                        return message.reply("🔄 Sessione AI cancellata e conteggio resettato a 0.");
                    }
                }

                // Estrae il numero dall'inizio del messaggio
                const match = content.match(/^(\d+)/);
                if (!match) return; // Se è testo semplice senza numero, lascia chattare senza rompere le scatole

                const guessedNumber = parseInt(match[1], 10);
                const expectedNumber = config.currentNumber + 1;

                // Controllo doppio invio
                if (message.author.id === config.lastUserId) {
                    await message.react("❌").catch(() => {});
                    const reply = await message.reply("⚠️ Non puoi inviare due numeri di fila! Aspetta che qualcun altro scriva.").catch(() => {});
                    setTimeout(() => reply?.delete().catch(() => {}), 5000);
                    return;
                }

                // Controllo numero corretto o errato
                if (guessedNumber === expectedNumber) {
                    await saveCountingSetup(message.guild.id, {
                        currentNumber: expectedNumber,
                        lastUserId: message.author.id
                    });
                    await message.react("✅").catch(() => {});

                    // Se l'AI è attiva nel counting e il bot deve rispondere
                    if (config.aiEnabled && message.channel.id === AI_CHANNEL_ID) {
                        const aiNextNumber = expectedNumber + 1;
                        setTimeout(async () => {
                            await saveCountingSetup(message.guild.id, {
                                currentNumber: aiNextNumber,
                                lastUserId: client.user.id
                            });
                            await message.channel.send(aiNextNumber.toString());
                        }, 1000);
                    }
                } else {
                    await message.react("❌").catch(() => {});
                    await message.channel.send(`❌ Hai sbagliato! Il numero corretto era **${expectedNumber}**, ma tu hai detto **${guessedNumber}**. (Partita resettata a 0)`).catch(() => {});

                    await saveCountingSetup(message.guild.id, {
                        currentNumber: 0,
                        lastUserId: null
                    });
                }
            } catch (e) {
                console.error("[LOG ERROR] counting messageCreate:", e);
            }
        });
    },

    getGuildCountingConfig,
    saveCountingSetup
};
    
