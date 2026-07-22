// ==========================================
// FILE: minigame.js - PARTE 1
// ==========================================
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

const activeGames = new Map();

// --- DATABASE QUIZ ---
const QUIZ_QUESTIONS = [
    { q: "Qual è il pianeta più vicino al Sole?", options: ["Venere", "Mercurio", "Marte", "Terra"], answer: "Mercurio" },
    { q: "Chi ha dipinto la Gioconda?", options: ["Michelangelo", "Leonardo da Vinci", "Raffaello", "Donatello"], answer: "Leonardo da Vinci" },
    { q: "In quale anno è sbarcato l'uomo sulla Luna?", options: ["1965", "1969", "1972", "1980"], answer: "1969" },
    { q: "Qual è l'elemento chimico con simbolo 'Au'?", options: ["Argento", "Rame", "Oro", "Alluminio"], answer: "Oro" },
    { q: "Quanti continenti ci sono sulla Terra?", options: ["5", "6", "7", "8"], answer: "7" },
    { q: "Qual è la capitale del Giappone?", options: ["Kyoto", "Tokyo", "Osaka", "Hiroshima"], answer: "Tokyo" },
    { q: "Chi ha scritto la Divina Commedia?", options: ["Petrarca", "Boccaccio", "Dante Alighieri", "Manzoni"], answer: "Dante Alighieri" },
    { q: "Qual è il monte più alto del mondo?", options: ["K2", "Everest", "Monte Bianco", "Kilimangiaro"], answer: "Everest" },
    { q: "In che stato si trova la torre di Pisa?", options: ["Francia", "Spagna", "Italia", "Grecia"], answer: "Italia" },
    { q: "Quale oceano è il più grande?", options: ["Atlantico", "Indiano", "Artico", "Pacifico"], answer: "Pacifico" }
];

// --- DATABASE INDOVINELLI BOMBA ---
const BOMB_WIRES_POOL = [
    { text: "Sono il colore del sangue e del fuoco. Tagliami se hai coraggio.", correct: "rosso" },
    { text: "Rappresento l'oceano profondo e la calma gelida.", correct: "blu" },
    { text: "Nasco unendo la luce del sole e il cielo. Sono la vita nei campi.", correct: "verde" },
    { text: "Sono l'oro dei folli e il colore del sole a mezzogiorno.", correct: "giallo" },
    { text: "Il mio colore ricorda la notte senza stelle e il carbone.", correct: "nero" }
];

// --- DATABASE IMPICCATO ---
const HANGMAN_WORDS = [
    "DISCORD", "BOT", "PROGRAMMARE", "JAVASCRIPT", "GAMING", "COMPUTER", "SERVER", "CODICE",
    "SVILUPPATORE", "TASTIERA", "SCHERMO", "INTERNET", "FUNZIONE", "VARIABILE", "STRINGA"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minigame')
        .setDescription('🎮 Apri l\'hub dei minigiochi interattivi!'),

    async execute(interaction) {
        const userId = interaction.user.id;

        if (activeGames.has(userId)) {
            return interaction.reply({ 
                content: "⚠️ **Hai già un minigioco in corso!** Termina quello attuale prima di aprirne un altro.", 
                flags: 64 
            });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('game_hub_select')
            .setPlaceholder('🎮 Scegli un minigioco da avviare...')
            .addOptions([
                { label: '🧠 Quiz Arcade', description: 'Metti alla prova la tua cultura generale', value: 'play_quiz' },
                { label: '💣 Artificiere', description: 'Disinnesca la bomba risolvendo l’indovinello', value: 'play_bomb' },
                { label: '🔢 Memoria', description: 'Memorizza la sequenza numerica e ripetila', value: 'play_memory' },
                { label: '⚡ Reazione Fulminea', description: 'Premi il tasto più veloce di tutti', value: 'play_reaction' },
                { label: '🪢 Impiccato', description: 'Indovina la parola segreta a tema tech', value: 'play_hangman' },
                { label: '🎰 Ruota della Fortuna', description: 'Fai girare la ruota e tenta la fortuna', value: 'play_wheel' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('🎮 Arcade & Minigames Hub')
            .setDescription('Benvenuto nel centro giochi ufficiale! Seleziona dal menu a tendina qui sotto il minigioco a cui vuoi giocare.\n\n*Nota: Puoi giocare a un gioco alla volta!*');

        await interaction.reply({ embeds: [embed], components: [row] });
    },

    async handleGameInteraction(interaction) {
        if (!interaction.isStringSelectMenu() || interaction.customId !== 'game_hub_select') return;

        const userId = interaction.user.id;
        const choice = interaction.values[0];

        if (activeGames.has(userId)) {
            return interaction.update({ 
                content: "⚠️ **Hai già un minigioco in corso!** Termina quello attuale.", 
                embeds: [], 
                components: [] 
            });
        }

        activeGames.set(userId, true);

        try {
            if (choice === 'play_quiz') await startQuiz(interaction);
            else if (choice === 'play_bomb') await startBomb(interaction);
            else if (choice === 'play_memory') await startMemory(interaction);
            else if (choice === 'play_reaction') await startReaction(interaction);
            else if (choice === 'play_hangman') await startHangman(interaction);
            else if (choice === 'play_wheel') await startWheel(interaction);
        } catch (error) {
            console.error("Errore nell'avvio del minigioco:", error);
            activeGames.delete(userId);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "❌ Si è verificato un errore nell'avviare il gioco.", flags: 64 }).catch(() => {});
            }
        }
    }
};

// ==========================================
// FILE: minigame.js - PARTE 2
// ==========================================

async function startQuiz(interaction) {
    const userId = interaction.user.id;
    const randomQ = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];

    const row = new ActionRowBuilder().addComponents(
        randomQ.options.map(opt => 
            new ButtonBuilder()
                .setCustomId(`quiz_${opt === randomQ.answer ? 'correct' : 'wrong'}`)
                .setLabel(opt)
                .setStyle(ButtonStyle.Secondary)
        )
    );

    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🧠 Quiz Arcade')
        .setDescription(`**${randomQ.q}**\n\nHai 15 secondi per rispondere!`);

    await interaction.update({ content: null, embeds: [embed], components: [row] });
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 15000 });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return i.reply({ content: "Questo minigioco non è per te!", flags: 64 });

        activeGames.delete(userId);
        if (i.customId === 'quiz_correct') {
            await i.update({ content: "✅ **Risposta esatta!** Complimenti!", embeds: [], components: [] });
        } else {
            await i.update({ content: `❌ **Errata!** La risposta corretta era: **${randomQ.answer}**`, embeds: [], components: [] });
        }
        collector.stop();
    });

    collector.on('end', async collected => {
        if (collected.size === 0) {
            activeGames.delete(userId);
            await interaction.editReply({ content: "⏰ **Tempo scaduto!**", embeds: [], components: [] }).catch(() => {});
        }
    });
}

async function startBomb(interaction) {
    const userId = interaction.user.id;
    const rawRiddle = BOMB_WIRES_POOL[Math.floor(Math.random() * BOMB_WIRES_POOL.length)];
    const correctWire = rawRiddle.correct.toLowerCase();

    const wires = ['rosso', 'blu', 'verde', 'giallo'];
    const row = new ActionRowBuilder().addComponents(
        wires.map(w => 
            new ButtonBuilder()
                .setCustomId(`bomb_${w}`)
                .setLabel(`Taglia ${w.toUpperCase()}`)
                .setStyle(ButtonStyle.Primary)
        )
    );

    const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('💣 Artificiere')
        .setDescription(`📜 **Indovinello:**\n"${rawRiddle.text}"\n\nTaglia il cavo giusto (10 secondi)!`);

    await interaction.update({ content: null, embeds: [embed], components: [row] });
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 10000 });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return i.reply({ content: "Non toccare la bomba altrui!", flags: 64 });

        activeGames.delete(userId);
        const chosenWire = i.customId.replace('bomb_', '');
        if (chosenWire === correctWire) {
            await i.update({ content: `🎉 **BOOM EVITATO!** Cavo corretto (${correctWire}).`, embeds: [], components: [] });
        } else {
            await i.update({ content: `💥 **KABOOOM!** Hai tagliato il ${chosenWire}, ma era il ${correctWire}!`, embeds: [], components: [] });
        }
        collector.stop();
    });

    collector.on('end', async collected => {
        if (collected.size === 0) {
            activeGames.delete(userId);
            await interaction.editReply({ content: "💥 **KABOOOM!** Tempo scaduto.", embeds: [], components: [] }).catch(() => {});
        }
    });
}

async function startMemory(interaction) {
    const userId = interaction.user.id;
    const sequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4) + 1);
    
    await interaction.update({ content: `🧠 **Memorizza la sequenza:**\n# ➡️ ${sequence.join(' - ')}\n\n*Tra 4 secondi si parte...*`, embeds: [], components: [] });

    setTimeout(async () => {
        const row = new ActionRowBuilder().addComponents(
            [1, 2, 3, 4].map(n => new ButtonBuilder().setCustomId(`mem_${n}`).setLabel(n.toString()).setStyle(ButtonStyle.Secondary))
        );

        let userGuess = [];
        await interaction.editReply({ content: "🔢 **Tocca a te!** Inserisci la sequenza esatta:", components: [row] }).catch(() => {});
        const msg = await interaction.fetchReply();
        
        const filter = i => i.user.id === userId;
        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            userGuess.push(parseInt(i.customId.replace('mem_', '')));

            if (userGuess.length === sequence.length) {
                collector.stop();
                activeGames.delete(userId);
                if (userGuess.every((val, idx) => val === sequence[idx])) {
                    await i.update({ content: "🏆 **Corretto! Memoria di ferro!**", components: [] });
                } else {
                    await i.update({ content: `❌ **Errata!** Era: ${sequence.join(' - ')}`, components: [] });
                }
            } else {
                await i.update({ content: `🔢 Inserito: **${userGuess.join(' - ')}** ... Continua!`, components: [row] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                activeGames.delete(userId);
                interaction.editReply({ content: "⏰ **Tempo scaduto!**", components: [] }).catch(() => {});
            }
        });
    }, 4000);
}

async function startReaction(interaction) {
    const userId = interaction.user.id;
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('react_btn').setLabel('PREMI ORA!').setStyle(ButtonStyle.Danger).setDisabled(true)
    );

    await interaction.update({ content: "⚡ Preparati...", embeds: [], components: [row] });
    const msg = await interaction.fetchReply();
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;

    setTimeout(async () => {
        const activeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('react_btn_active').setLabel('PREMI ORA!').setStyle(ButtonStyle.Success)
        );

        await interaction.editReply({ content: "🚨 **VIA! Premi il pulsante!**", components: [activeRow] }).catch(() => {});
        const startTime = Date.now();

        const collector = msg.createMessageComponentCollector({ time: 5000 });
        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: "Non bruciare la mossa!", flags: 64 });

            activeGames.delete(userId);
            const reactionTime = Date.now() - startTime;
            collector.stop();

            await i.update({ content: `⚡ **Fulmineo!** Tempo: **${reactionTime}ms**!`, components: [] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                activeGames.delete(userId);
                interaction.editReply({ content: "🐢 **Tempo scaduto!**", components: [] }).catch(() => {});
            }
        });
    }, randomDelay);
}

async function startHangman(interaction) {
    const userId = interaction.user.id;
    const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    let guessedLetters = [];
    let errors = 0;
    const maxErrors = 5;

    function getWordDisplay() {
        return word.split('').map(char => guessedLetters.includes(char) ? char : '🔲').join(' ');
    }

    function getHangmanMenu() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        const availableLetters = alphabet.filter(l => !guessedLetters.includes(l)).slice(0, 25);
        
        if (availableLetters.length === 0) return null;

        return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('hangman_letter')
                .setPlaceholder('Scegli una lettera disponibile')
                .addOptions(availableLetters.map(l => ({ label: l, value: l })))
        );
    }

    const initialRow = getHangmanMenu();
    const embed = new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('🪢 Impiccato Tech')
        .setDescription(`Parola:\n# ${getWordDisplay()}\n\nErrori: **${errors}/${maxErrors}**`);

    await interaction.update({ content: null, embeds: [embed], components: [initialRow] });
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return i.reply({ content: "Non è il tuo turno!", flags: 64 });

        const letter = i.values[0];
        if (!guessedLetters.includes(letter)) guessedLetters.push(letter);
        if (!word.includes(letter)) errors++;

        const won = word.split('').every(char => guessedLetters.includes(char));
        const lost = errors >= maxErrors;

        if (won) {
            activeGames.delete(userId);
            collector.stop();
            await i.update({ content: `🎉 **Vittoria!** La parola era **${word}**!`, embeds: [], components: [] });
        } else if (lost) {
            activeGames.delete(userId);
            collector.stop();
            await i.update({ content: `💀 **Game Over!** La parola era **${word}**.`, embeds: [], components: [] });
        } else {
            const nextRow = getHangmanMenu();
            const updatedEmbed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle('🪢 Impiccato Tech')
                .setDescription(`Parola:\n# ${getWordDisplay()}\n\nLettere scelte: ${guessedLetters.join(', ')}\nErrori: **${errors}/${maxErrors}**`);
            
            await i.update({ embeds: [updatedEmbed], components: nextRow ? [nextRow] : [] });
        }
    });

    collector.on('end', async collected => {
        if (collected.size === 0) {
            activeGames.delete(userId);
            await interaction.editReply({ content: `⏰ **Tempo scaduto!** Era **${word}**.`, embeds: [], components: [] }).catch(() => {});
        }
    });
}

async function startWheel(interaction) {
    const userId = interaction.user.id;
    const outcomes = [
        "Sfortuna... niente vincita stavolta!",
        "Piccola Vincita!",
        "Media Vincita!",
        "GRANDE JACKPOT! 🎰"
    ];

    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('🎰 Ruota della Fortuna')
        .setDescription(`La ruota gira...\n\nRisultato: **${result}**`);

    activeGames.delete(userId);
    await interaction.update({ content: null, embeds: [embed], components: [] });
                                                                }
