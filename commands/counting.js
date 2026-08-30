// ==========================================
// FILE: counting.js (VERSIONE FINALE E DEFINITIVA)
// ==========================================
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");
const Setup = require("./Setup");

// Helper salvataggio MongoDB per il Counting
const saveCountingSetup = async (guildId, data) => {
    try {
        const updateData = {};
        if (data.countingChannel !== undefined) updateData.countingChannel = data.countingChannel;
        if (data.aiEnabled !== undefined) updateData.countingAiEnabled = data.aiEnabled;
        if (data.currentNumber !== undefined) updateData.countingCurrentNumber = data.currentNumber;
        if (data.lastUserId !== undefined) updateData.countingLastUserId = data.lastUserId;
        if (data.aiChannel !== undefined) updateData.countingAiChannel = data.aiChannel;

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
    if (!guildId) return { countingChannel: null, aiChannel: null, aiEnabled: false, currentNumber: 0, lastUserId: null };
    try {
        let setup = await Setup.findOne({ guildId });
        if (!setup) {
            setup = await Setup.create({ 
                guildId, 
                countingChannel: null, 
                aiChannel: null,
                countingAiEnabled: false, 
                countingCurrentNumber: 0, 
                countingLastUserId: null 
            });
        }
        return {
            countingChannel: setup.countingChannel || null,
            aiChannel: setup.countingAiChannel || null,
            aiEnabled: setup.countingAiEnabled ?? false,
            currentNumber: setup.countingCurrentNumber ?? 0,
            lastUserId: setup.countingLastUserId || null
        };
    } catch (e) {
        console.error("[MONGO ERROR] Errore lettura Counting:", e);
        return { countingChannel: null, aiChannel: null, aiEnabled: false, currentNumber: 0, lastUserId: null };
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("counting")
        .setDescription("Gestione del sistema di Counting")
        .addSubcommand(subcommand =>
            subcommand
                .setName("setup")
                .setDescription("Imposta il canale corrente come canale per il Counting globale")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("ai")
                .setDescription("Imposta il canale corrente per il Counting con l'AI")
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: "❌ Devi essere un **Amministratore** per configurare i canali di Counting.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 📌 SUBCOMMAND: /counting setup (Canale corrente automatico)
        if (subcommand === "setup") {
            const targetChannel = interaction.channel;

            await saveCountingSetup(guildId, { countingChannel: targetChannel.id });

            const embed = new EmbedBuilder()
                .setTitle("🔢 Canale Counting Normale Configurato!")
                .setColor(0x57F287)
                .setDescription(`Il gioco del Counting è ora attivo in ${targetChannel}!\n\n**Regole:**\n- Si parte da **1** (o si continua dal numero precedente).\n- Puoi chiacchierare liberamente, ma se invii un numero deve essere **SEMPRE all'inizio** (es. *723 grande!*).\n- Un utente non può inviare due numeri di fila.`)
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] }).catch(() => {});
            return interaction.reply({ 
                content: `✅ Canale impostato automaticamente in ${targetChannel} e salvato su MongoDB Cloud!`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 📌 SUBCOMMAND: /counting ai (Canale corrente automatico)
        if (subcommand === "ai") {
            const targetChannel = interaction.channel;

            await saveCountingSetup(guildId, { aiChannel: targetChannel.id, aiEnabled: true, currentNumber: 0, lastUserId: null });

            const embed = new EmbedBuilder()
                .setTitle("🤖 Modalità Counting AI Configurata!")
                .setColor(0x5865F2)
                .setDescription(`Il canale ${targetChannel} è stato impostato per il Counting con l'AI!\n\n- Scrivi **` + "`inizia`" + `** se vuoi che inizi ad aiutarti a contare partendo da 1.\n- Scrivi **` + "`cancella`" + `** se vuoi cancellare il supporto dell'AI e resettare la sessione.`)
                .setFooter({ text: "Il bot conterà e interagirà direttamente qui!" });

            await targetChannel.send({ embeds: [embed] }).catch(() => {});
            return interaction.reply({
                content: `✅ Canale AI impostato automaticamente in ${targetChannel} e salvato su MongoDB Cloud!`,
                flags: MessageFlags.Ephemeral
            });
        }
    },

    // 🛡️ Gestione Eventi Messaggi per ENTRAMBI i Counting
    initEvents(client) {
        client.on("messageCreate", async (message) => {
            try {
                if (!message.guild) return;

                const config = await getGuildCountingConfig(message.guild.id);
                const content = message.content.trim();
                if (!content) return;

                // ==========================================
                // 🤖 GESTIONE CANALE COUNTING AI
                // ==========================================
                if (config.aiChannel && message.channel.id === config.aiChannel) {
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
                            aiEnabled: false,
                            aiChannel: null
                        });
                        return message.reply("🔄 Sessione AI cancellata e conteggio resettato a 0.");
                    }

                    // Se il bot scrive nel canale AI, ignoriamo
                    if (message.author.bot) {
                        if (message.author.id === client.user.id) return;
                        return;
                    }

                    // Logica numeri nel canale AI
                    const aiMatch = content.match(/^(\d+)/);
                    if (!aiMatch) return; // Se scrive testo normale nel canale AI, ignoriamo

                    const guessedNumber = parseInt(aiMatch[1], 10);
                    const expectedNumber = config.currentNumber + 1;

                    if (message.author.id === config.lastUserId) {
                        await message.react("❌").catch(() => {});
                        const reply = await message.reply("⚠️ Non puoi inviare due numeri di fila! Aspetta che risponda io.").catch(() => {});
                        setTimeout(() => reply?.delete().catch(() => {}), 5000);
                        return;
                    }

                    if (guessedNumber === expectedNumber) {
                        await saveCountingSetup(message.guild.id, {
                            currentNumber: expectedNumber,
                            lastUserId: message.author.id
                        });
                        await message.react("✅").catch(() => {});

                        // L'AI risponde dicendo SOLO il numero successivo in modo pulito
                        const aiNextNumber = expectedNumber + 1;
                        setTimeout(async () => {
                            await saveCountingSetup(message.guild.id, {
                                currentNumber: aiNextNumber,
                                lastUserId: client.user.id
                            });
                            await message.channel.send(aiNextNumber.toString());
                        }, 1000);
                    } else {
                        await message.react("❌").catch(() => {});
                        await message.channel.send(`❌ Hai sbagliato! Il numero corretto era **${expectedNumber}**, ma tu hai detto **${guessedNumber}**. (Partita resettata a 0)`).catch(() => {});
                        await saveCountingSetup(message.guild.id, {
                            currentNumber: 0,
                            lastUserId: null
                        });
                    }
                    return;
                }

                // ==========================================
                // 🔢 GESTIONE CANALE COUNTING NORMALE
                // ==========================================
                if (!config.countingChannel || message.channel.id !== config.countingChannel) return;
                if (message.author.bot) return;

                const match = content.match(/^(\d+)/);
                if (!match) return; // Se è una chiacchierata normale senza numero all'inizio, ignora e lascia scrivere

                const guessedNumber = parseInt(match[1], 10);
                const expectedNumber = config.currentNumber + 1;

                if (message.author.id === config.lastUserId) {
                    await message.react("❌").catch(() => {});
                    const reply = await message.reply("⚠️ Non puoi inviare due numeri di fila! Aspetta che qualcun altro scriva.").catch(() => {});
                    setTimeout(() => reply?.delete().catch(() => {}), 5000);
                    return;
                }

                if (guessedNumber === expectedNumber) {
                    await saveCountingSetup(message.guild.id, {
                        currentNumber: expectedNumber,
                        lastUserId: message.author.id
                    });
                    await message.react("✅").catch(() => {});
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
                
