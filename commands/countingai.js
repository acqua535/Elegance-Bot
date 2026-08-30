// ==========================================
// FILE: countingai.js (Counting AI)
// ==========================================
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");
const Setup = require("./Setup");

const saveAiSetup = async (guildId, data) => {
    try {
        const updateData = {};
        if (data.aiChannel !== undefined) updateData.aiChannel = data.aiChannel;
        if (data.aiEnabled !== undefined) updateData.aiEnabled = data.aiEnabled;
        if (data.currentNumber !== undefined) updateData.aiCurrentNumber = data.currentNumber;
        if (data.lastUserId !== undefined) updateData.aiLastUserId = data.lastUserId;

        return await Setup.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { upsert: true, new: true }
        );
    } catch (e) {
        console.error("[MONGO ERROR] Errore salvataggio Counting AI:", e);
        return null;
    }
};

const getAiConfig = async (guildId) => {
    if (!guildId) return { aiChannel: null, aiEnabled: false, currentNumber: 0, lastUserId: null };
    try {
        let setup = await Setup.findOne({ guildId });
        if (!setup) {
            setup = await Setup.create({ 
                guildId, 
                aiChannel: null, 
                aiEnabled: false, 
                aiCurrentNumber: 0, 
                aiLastUserId: null 
            });
        }
        return {
            aiChannel: setup.aiChannel || null,
            aiEnabled: setup.aiEnabled ?? false,
            currentNumber: setup.aiCurrentNumber ?? 0,
            lastUserId: setup.aiLastUserId || null
        };
    } catch (e) {
        console.error("[MONGO ERROR] Errore lettura Counting AI:", e);
        return { aiChannel: null, aiEnabled: false, currentNumber: 0, lastUserId: null };
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("countingai")
        .setDescription("Imposta il canale per il Counting con l'AI")
        .addSubcommand(subcommand =>
            subcommand
                .setName("setup")
                .setDescription("Imposta il canale corrente per il Counting AI")
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: "❌ Devi essere un **Amministratore** per configurare il Counting AI.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const guildId = interaction.guild.id;
        const targetChannel = interaction.channel;

        await saveAiSetup(guildId, { aiChannel: targetChannel.id, aiEnabled: true, currentNumber: 0, lastUserId: null });

        const embed = new EmbedBuilder()
            .setTitle("🤖 Modalità Counting AI Configurata!")
            .setColor(0x5865F2)
            .setDescription(`Il canale ${targetChannel} è attivo per il Counting con l'AI!\n\n- Scrivi **\`inizia\`** per partire da 1.\n- Scrivi **\`cancella\`** per resettare la sessione.`)
            .setTimestamp();

        await targetChannel.send({ embeds: [embed] }).catch(() => {});
        return interaction.reply({ 
            content: `✅ Canale AI impostato con successo in ${targetChannel}!`, 
            flags: MessageFlags.Ephemeral 
        });
    },

    initEvents(client) {
        client.on("messageCreate", async (message) => {
            try {
                if (!message.guild) return;

                const config = await getAiConfig(message.guild.id);
                if (!config.aiChannel || message.channel.id !== config.aiChannel) return;

                const content = message.content.trim();
                if (!content) return;

                // Gestione comandi testuali nel canale AI
                if (content.toLowerCase() === "inizia") {
                    const nextNum = 1;
                    await saveAiSetup(message.guild.id, {
                        currentNumber: nextNum,
                        lastUserId: client.user.id
                    });
                    return message.channel.send(nextNum.toString());
                }
                if (content.toLowerCase() === "cancella") {
                    await saveAiSetup(message.guild.id, {
                        currentNumber: 0,
                        lastUserId: null,
                        aiEnabled: false,
                        aiChannel: null
                    });
                    return message.reply("🔄 Sessione AI cancellata e conteggio resettato a 0.");
                }

                if (message.author.bot) return;

                const match = content.match(/^(\d+)/);
                if (!match) return;

                const guessedNumber = parseInt(match[1], 10);
                const expectedNumber = config.currentNumber + 1;

                if (message.author.id === config.lastUserId) {
                    await message.react("❌").catch(() => {});
                    const reply = await message.reply("⚠️ Non puoi inviare due numeri di fila! Aspetta che risponda io.").catch(() => {});
                    setTimeout(() => reply?.delete().catch(() => {}), 5000);
                    return;
                }

                if (guessedNumber === expectedNumber) {
                    await saveAiSetup(message.guild.id, {
                        currentNumber: expectedNumber,
                        lastUserId: message.author.id
                    });
                    await message.react("✅").catch(() => {});

                    // Risposta automatica dell'AI
                    const aiNextNumber = expectedNumber + 1;
                    setTimeout(async () => {
                        await saveAiSetup(message.guild.id, {
                            currentNumber: aiNextNumber,
                            lastUserId: client.user.id
                        });
                        await message.channel.send(aiNextNumber.toString());
                    }, 1000);
                } else {
                    await message.react("❌").catch(() => {});
                    await message.channel.send(`❌ Hai sbagliato! Il numero corretto era **${expectedNumber}**, ma tu hai detto **${guessedNumber}**. (Partita resettata a 0)`).catch(() => {});
                    await saveAiSetup(message.guild.id, {
                        currentNumber: 0,
                        lastUserId: null
                    });
                }
            } catch (e) {
                console.error("[LOG ERROR] countingai messageCreate:", e);
            }
        });
    },

    getAiConfig,
    saveAiSetup
};
                  
