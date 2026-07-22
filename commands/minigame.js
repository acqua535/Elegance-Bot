// minigame.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const inventory = require('./inventory');
const achievements = require('../achievements');

const QUIZ_QUESTIONS = [
    { q: "Qual è il pianeta più vicino al Sole?", options: ["Venere", "Mercurio", "Marte", "Terra"], answer: "Mercurio" },
    { q: "Chi ha dipinto la Gioconda?", options: ["Michelangelo", "Leonardo da Vinci", "Raffaello", "Donatello"], answer: "Leonardo da Vinci" },
    { q: "In quale anno è sbarcato l'uomo sulla Luna?", options: ["1965", "1969", "1972", "1980"], answer: "1969" },
    { q: "Qual è l'elemento chimico con simbolo 'Au'?", options: ["Argento", "Rame", "Oro", "Alluminio"], answer: "Oro" },
    { q: "Quanti continenti ci sono sulla Terra?", options: ["5", "6", "7", "8"], answer: "7" }
];

const BOMB_WIRES_POOL = [
    { text: "Sono il colore del sangue e del fuoco. Tagliami se hai coraggio.", correct: "rosso" },
    { text: "Rappresento l'oceano profondo e la calma gelida.", correct: "blu" },
    { text: "Nasco unendo la luce del sole e il cielo. Sono la vita nei campi.", correct: "verde" },
    { text: "Sono l'oro dei folli e il colore del sole a mezzogiorno.", correct: "giallo" }
];

const HANGMAN_WORDS = ["DISCORD", "BOT", "PROGRAMMARE", "JAVASCRIPT", "GAMING", "COMPUTER", "SERVER", "CODICE"];

async function startQuiz(interaction) {
    const userId = interaction.user.id;
    const randomQ = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    inventory.incrementStat(userId, "gamesPlayed");

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

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ time: 15000 });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return i.reply({ content: "Questo minigioco non è per te!", ephemeral: true });

        if (i.customId === 'quiz_correct') {
            inventory.addXP(userId, 80);
            inventory.addCoins(userId, 40);
            inventory.incrementStat(userId, "gamesWon");
            inventory.incrementStat(userId, "quizzesWon");
            await achievements.checkAndNotify(userId, interaction.client);
            await i.update({ content: "✅ **Risposta esatta!** +80 XP e +40 monete!", embeds: [], components: [] });
        } else {
            await i.update({ content: `❌ **Errata!** Era: **${randomQ.answer}**`, embeds: [], components: [] });
        }
        collector.stop();
    });

    collector.on('end', async collected => {
        if (collected.size === 0) await interaction.editReply({ content: "⏰ Tempo scaduto!", embeds: [], components: [] });
    });
}

async function startBomb(interaction) {
    const userId = interaction.user.id;
    inventory.incrementStat(userId, "gamesPlayed");

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

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ time: 10000 });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return i.reply({ content: "Non toccare la bomba altrui!", ephemeral: true });

        const chosenWire = i.customId.replace('bomb_', '');
        if (chosenWire === correctWire) {
            inventory.addXP(userId, 150);
            inventory.addCoins(userId, 75);
            inventory.incrementStat(userId, "gamesWon");
            inventory.incrementStat(userId, "bombsDefused");
            await achievements.checkAndNotify(userId, interaction.client);
            await i.update({ content: `🎉 **BOOM EVITATO!** Cavo corretto (${correctWire}). +150 XP e +75 monete!`, embeds: [], components: [] });
        } else {
            await i.update({ content: `💥 **KABOOOM!** Hai tagliato il ${chosenWire}, ma era il ${correctWire}!`, embeds: [], components: [] });
        }
        collector.stop();
    });

    collector.on('end', async collected => {
        if (collected.size === 0) await interaction.editReply({ content: "💥 **KABOOOM!** Tempo scaduto.", embeds: [], components: [] });
    });
}

async function startMemory(interaction) {
    const userId = interaction.user.id;
    inventory.incrementStat(userId, "gamesPlayed");

    const sequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4) + 1);
    await interaction.reply({ content: `🧠 **Memorizza la sequenza:**\n# ➡️ ${sequence.join(' - ')}`, ephemeral: true });

    setTimeout(async () => {
        const row = new ActionRowBuilder().addComponents(
            [1, 2, 3, 4].map(n => new ButtonBuilder().setCustomId(`mem_${n}`).setLabel(n.toString()).setStyle(ButtonStyle.Secondary))
        );

        let userGuess = [];
        const msg = await interaction.followUp({ content: "Inserisci la sequenza esatta:", components: [row], ephemeral: true });
        
        const filter = i => i.user.id === userId;
        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            userGuess.push(parseInt(i.customId.replace('mem_', '')));

            if (userGuess.length === sequence.length) {
                collector.stop();
                if (userGuess.every((val, idx) => val === sequence[idx])) {
                    inventory.addXP(userId, 120);
                    inventory.addCoins(userId, 60);
                    inventory.incrementStat(userId, "gamesWon");
                    inventory.incrementStat(userId, "memoryWon");
                    await achievements.checkAndNotify(userId, interaction.client);
                    await i.update({ content: "🏆 **Corretto!** +120 XP e +60 monete!", components: [] });
                } else {
                    await i.update({ content: `❌ **Errata!** Era: ${sequence.join(' - ')}`, components: [] });
                }
            } else {
                await i.update({ content: `Inserito: ${userGuess.join(' - ')} ... Continua!`, components: [row] });
            }
        });
    }, 4000);
}

async function startReaction(interaction) {
    const userId = interaction.user.id;
    inventory.incrementStat(userId, "gamesPlayed");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('react_btn').setLabel('PREMI ORA!').setStyle(ButtonStyle.Danger).setDisabled(true)
    );

    const msg = await interaction.reply({ content: "⚡ Preparati...", components: [row], fetchReply: true });
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;

    setTimeout(async () => {
        const activeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('react_btn_active').setLabel('PREMI ORA!').setStyle(ButtonStyle.Success)
        );

        await interaction.editReply({ content: "🚨 **VIA! Premi il pulsante!**", components: [activeRow] });
        const startTime = Date.now();

        const collector = msg.createMessageComponentCollector({ time: 5000 });
        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: "Non bruciare la mossa!", ephemeral: true });

            const reactionTime = Date.now() - startTime;
            collector.stop();

            inventory.addXP(userId, 100);
            inventory.addCoins(userId, 50);
            inventory.incrementStat(userId, "gamesWon");
            inventory.incrementStat(userId, "reactionWon");
            await achievements.checkAndNotify(userId, interaction.client);
            await i.update({ content: `⚡ **Fulmineo!** ${reactionTime}ms. +100 XP e +50 monete!`, components: [] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) interaction.editReply({ content: "🐢 Tempo scaduto!", components: [] });
        });
    }, randomDelay);
}

async function startHangman(interaction) {
    const userId = interaction.user.id;
    inventory.incrementStat(userId, "gamesPlayed");

    const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    let guessedLetters = [];
    let errors = 0;
    const maxErrors = 5;

    function getWordDisplay() {
        return word.split('').map(char => guessedLetters.includes(char) ? char : '🔲').join(' ');
    }

    const getRow = () => new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('hangman_letter')
            .setPlaceholder('Scegli una lettera')
            .addOptions("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').slice(0, 25).map(l => ({ label: l, value: l })))
    );

    const embed = new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('🪢 Impiccato')
        .setDescription(`Parola:\n# ${getWordDisplay()}\n\nErrori: ${errors}/${maxErrors}`);

    const msg = await interaction.reply({ embeds: [embed], components: [getRow()], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ time: 30000 });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return i.reply({ content: "Non è il tuo turno!", ephemeral: true });

        const letter = i.values[0];
        if (!guessedLetters.includes(letter)) guessedLetters.push(letter);
        if (!word.includes(letter)) errors++;

        const won = word.split('').every(char => guessedLetters.includes(char));
        const lost = errors >= maxErrors;

        if (won) {
            collector.stop();
            inventory.addXP(userId, 150);
            inventory.addCoins(userId, 70);
            inventory.incrementStat(userId, "gamesWon");
            inventory.incrementStat(userId, "hangmanWon");
            await achievements.checkAndNotify(userId, interaction.client);
            await i.update({ content: `🎉 **Vittoria!** Parola: **${word}**. +150 XP e +70 monete!`, embeds: [], components: [] });
        } else if (lost) {
            collector.stop();
            await i.update({ content: `💀 **Game Over!** Parola: **${word}**.`, embeds: [], components: [] });
        } else {
            const updatedEmbed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle('🪢 Impiccato')
                .setDescription(`Parola:\n# ${getWordDisplay()}\n\nLettere: ${guessedLetters.join(', ')}\nErrori: ${errors}/${maxErrors}`);
            
            await i.update({ embeds: [updatedEmbed], components: [getRow()] });
        }
    });
}

async function startWheel(interaction) {
    const userId = interaction.user.id;
    inventory.incrementStat(userId, "gamesPlayed");

    const outcomes = [
        { name: "Sfortuna (0 monete)", coins: 0, xp: 10, jackpot: false },
        { name: "Piccola Vincita", coins: 30, xp: 40, jackpot: false },
        { name: "Media Vincita", coins: 100, xp: 80, jackpot: false },
        { name: "GRANDE JACKPOT! 🎰", coins: 500, xp: 300, jackpot: true }
    ];

    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    inventory.addCoins(userId, result.coins);
    inventory.addXP(userId, result.xp);

    if (result.jackpot) {
        inventory.incrementStat(userId, "jackpots");
        inventory.incrementStat(userId, "gamesWon");
        await achievements.checkAndNotify(userId, interaction.client);
    } else if (result.coins > 0) {
        inventory.incrementStat(userId, "gamesWon");
    }

    const embed = new EmbedBuilder()
        .setColor(result.jackpot ? '#e67e22' : '#2ecc71')
        .setTitle('🎰 Ruota della Fortuna')
        .setDescription(`La ruota gira...\n\nRisultato: **${result.name}**\nHai vinto: +${result.coins} monete e +${result.xp} XP!`);

    await interaction.reply({ embeds: [embed] });
}

module.exports = {
    startQuiz,
    startBomb,
    startMemory,
    startReaction,
    startHangman,
    startWheel
};
            
