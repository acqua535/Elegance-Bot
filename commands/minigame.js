// minigame.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const inventory = require('./inventory');
const achievements = require('./achievements');

// ==========================================
// 🧠 1. DATABASE 50 QUIZ
// ==========================================
const QUIZ_QUESTIONS = [
    { q: "Qual è il pianeta più vicino al Sole?", options: ["Venere", "Mercurio", "Marte", "Terra"], answer: "Mercurio" },
    { q: "Chi ha dipinto la Gioconda?", options: ["Michelangelo", "Leonardo da Vinci", "Raffaello", "Donatello"], answer: "Leonardo da Vinci" },
    { q: "In quale anno è sbarcato l'uomo sulla Luna?", options: ["1965", "1969", "1972", "1980"], answer: "1969" },
    { q: "Qual è l'elemento chimico con simbolo 'Au'?", options: ["Argento", "Rame", "Oro", "Alluminio"], answer: "Oro" },
    { q: "Quanti continenti ci sono sulla Terra?", options: ["5", "6", "7", "8"], answer: "7" },
    { q: "Qual è la capitale dell'Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: "Canberra" },
    { q: "Chi ha scritto la Divina Commedia?", options: ["Petrarca", "Boccaccio", "Dante Alighieri", "Manzoni"], answer: "Dante Alighieri" },
    { q: "Quanto fa 8 x 8?", options: ["56", "64", "72", "48"], answer: "64" },
    { q: "Qual è l'animale terrestre più veloce?", options: ["Leone", "Ghepardo", "Tigre", "Leopardo"], answer: "Ghepardo" },
    { q: "In quale continente si trova il deserto del Sahara?", options: ["Asia", "America", "Africa", "Oceania"], answer: "Africa" },
    { q: "Qual è il monte più alto del mondo?", options: ["K2", "Everest", "Monte Bianco", "Kilimangiaro"], answer: "Everest" },
    { q: "Qual è il simbolo chimico dell'Acqua?", options: ["CO2", "H2O", "O2", "NaCl"], answer: "H2O" },
    { q: "Quanti lati ha un esagono?", options: ["5", "6", "7", "8"], answer: "6" },
    { q: "Qual è il paese più esteso al mondo?", options: ["Cina", "Stati Uniti", "Canada", "Russia"], answer: "Russia" },
    { q: "Chi ha inventato la lampadina a incandescenza commerciale?", options: ["Tesla", "Edison", "Einstein", "Meucci"], answer: "Edison" },
    { q: "Qual è la lingua più parlata al mondo per numero di madrelingua?", options: ["Inglese", "Spagnolo", "Mandarino", "Hindi"], answer: "Mandarino" },
    { q: "In quale anno è iniziata la Seconda Guerra Mondiale?", options: ["1939", "1941", "1945", "1914"], answer: "1939" },
    { q: "Qual è il pianeta più grande del Sistema Solare?", options: ["Saturno", "Giove", "Nettuno", "Urano"], answer: "Giove" },
    { q: "Qual è la capitale del Giappone?", options: ["Kyoto", "Osaka", "Tokyo", "Hiroshima"], answer: "Tokyo" },
    { q: "Quanti secondi ci sono in un'ora?", options: ["3600", "1800", "7200", "6000"], answer: "3600" },
    { q: "Chi ha scritto '1984'?", options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "J.K. Rowling"], answer: "George Orwell" },
    { q: "Qual è l'oceano più grande della Terra?", options: ["Atlantico", "Indiano", "Artico", "Pacifico"], answer: "Pacifico" },
    { q: "Qual è il metallo liquido a temperatura ambiente?", options: ["Ferro", "Mercurio", "Piombo", "Oro"], answer: "Mercurio" },
    { q: "In quale stato si trova la torre di Pisa?", options: ["Francia", "Spagna", "Italia", "Grecia"], answer: "Italia" },
    { q: "Qual è l'organo umano più grande?", options: ["Cuore", "Fegato", "Cervello", "Pelle"], answer: "Pelle" },
    { q: "Quanti giocatori ci sono in una squadra di calcio in campo?", options: ["9", "10", "11", "12"], answer: "11" },
    { q: "Chi ha formulato la teoria della relatività?", options: ["Newton", "Einstein", "Galilei", "Hawking"], answer: "Einstein" },
    { q: "Qual è la valuta ufficiale del Regno Unito?", options: ["Euro", "Dollaro", "Sterlina", "Franco"], answer: "Sterlina" },
    { q: "Qual è il gas più abbondante nell'atmosfera terrestre?", options: ["Ossigeno", "Azoto", "Anidride Carbonica", "Idrogeno"], answer: "Azoto" },
    { q: "In che anno l'Italia ha vinto i suoi ultimi Mondiali di calcio (al 2026)?", options: ["1994", "2002", "2006", "2010"], answer: "2006" },
    { q: "Qual è la capitale del Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: "Ottawa" },
    { q: "Chi ha scolpito il David?", options: ["Donatello", "Michelangelo", "Bernini", "Giotto"], answer: "Michelangelo" },
    { q: "Qual è il prefisso telefonico internazionale dell'Italia?", options: ["+33", "+34", "+39", "+44"], answer: "+39" },
    { q: "Qual è l'osso più lungo del corpo umano?", options: ["Omero", "Femore", "Tibia", "Radio"], answer: "Femore" },
    { q: "Qual è il fiume più lungo del mondo?", options: ["Nilo", "Amazzonia", "Mississippi", "Yangtze"], answer: "Nilo" },
    { q: "Quanti tasti ha un pianoforte standard?", options: ["88", "76", "64", "92"], answer: "88" },
    { q: "In quale città si trova il Colosseo?", options: ["Milano", "Napoli", "Roma", "Firenze"], answer: "Roma" },
    { q: "Qual è la radice quadrata di 144?", options: ["10", "11", "12", "14"], answer: "12" },
    { q: "Chi ha scoperto l'America?", options: ["Amerigo Vespucci", "Cristoforo Colombo", "Magellano", "Marco Polo"], answer: "Cristoforo Colombo" },
    { q: "Qual è l'animale simbolo del WWF?", options: ["Leone", "Panda", "Tigre", "Elefante"], answer: "Panda" },
    { q: "Qual è la capitale della Germania?", options: ["Monaco", "Francoforte", "Berlino", "Amburgo"], answer: "Berlino" },
    { q: "Quanti bit ci sono in un byte?", options: ["4", "8", "16", "32"], answer: "8" },
    { q: "Qual è il colore della bandiera delle Nazioni Unite?", options: ["Rosso", "Verde", "Blu", "Giallo"], answer: "Blu" },
    { q: "Chi ha dipinto 'La Notte Stellata'?", options: ["Monet", "Van Gogh", "Picasso", "Cézanne"], answer: "Van Gogh" },
    { q: "Qual è il pianeta conosciuto come il Pianeta Rosso?", options: ["Marte", "Venere", "Giove", "Saturno"], answer: "Marte" },
    { q: "Qual è il nome del cane di Topolino?", options: ["Snoopy", "Pluto", "Goofy", "Bolt"], answer: "Pluto" },
    { q: "In quale sport si usa un anello e un pallone arancione?", options: ["Calcio", "Basket", "Tennis", "Rugby"], answer: "Basket" },
    { q: "Qual è la capitale della Spagna?", options: ["Barcellona", "Valencia", "Madrid", "Siviglia"], answer: "Madrid" },
    { q: "Quale gas serve alle piante per la fotosintesi?", options: ["Ossigeno", "Azoto", "Anidride Carbonica", "Elio"], answer: "Anidride Carbonica" },
    { q: "Quanti anni durò la Guerra dei Cent'anni?", options: ["100", "105", "116", "99"], answer: "116" }
];

// ==========================================
// ✂️ 2. DATABASE 50 INDOVINELLI CAVI (Bomba)
// ==========================================
const BOMB_WIRES_POOL = [
    { text: "Sono il colore del sangue e del fuoco. Tagliami se hai coraggio.", correct: "rosso" },
    { text: "Rappresento l'oceano profondo e la calma gelida.", correct: "blu" },
    { text: "Nasco unendo la luce del sole e il cielo. Sono la vita nei campi.", correct: "verde" },
    { text: "Sono l'oro dei folli e il colore del sole a mezzogiorno.", correct: "giallo" },
    { text: "Logica: (Rosso + Giallo) - Rosso = ?", correct: "giallo" },
    { text: "Se unisci il blu e il rosso nei miei circuiti, che colore formo? (Prendi il principale primario freddo tra i due)", correct: "blu" },
    { text: "Non sono verde, non sono blu, non sono giallo. Quale rimasto sono?", correct: "rosso" },
    { text: "Nei semaori indico lo stop assoluto.", correct: "rosso" },
    { text: "Nei semaori indico il via libera.", correct: "verde" },
    { text: "Colore associato all'energia elettrica e alle banane.", correct: "giallo" },
    { text: "Colore associato al ghiaccio e all'acqua potabile nei tubi.", correct: "blu" },
    { text: "Il mio cavo è l'opposto esatto del verde nello spettro complementare base.", correct: "rosso" },
    { text: "Taglia il cavo che evoca la clorofilla.", correct: "verde" },
    { text: "Taglia il cavo che evoca lo zolfo puro.", correct: "giallo" },
    { text: "Taglia il cavo che evoca lo zaffiro.", correct: "blu" },
    { text: "Taglia il cavo che evoca il rubino.", correct: "rosso" },
    { text: "Frequenza di 700nm nello spettro visivo. Quale cavo è?", correct: "rosso" },
    { text: "Frequenza di 450nm nello spettro visivo. Quale cavo è?", correct: "blu" },
    { text: "Frequenza di 530nm nello spettro visivo. Quale cavo è?", correct: "verde" },
    { text: "Frequenza di 580nm nello spettro visivo. Quale cavo è?", correct: "giallo" },
    { text: "Rompicapo: Sono primario, caldo, e brucio.", correct: "rosso" },
    { text: "Rompicapo: Sono primario, freddo, e scorro.", correct: "blu" },
    { text: "Rompicapo: Sono secondario nei modelli RGB tradizionali caldi.", correct: "giallo" },
    { text: "Rompicapo: Sono il colore della foresta amazzonica.", correct: "verde" },
    { text: "Quale cavo ha il minor numero di lettere nel nome?", correct: "blu" },
    { text: "Quale cavo ha il maggior numero di lettere nel nome tra rosso, blu, verde, giallo?", correct: "giallo" },
    { text: "Se mescoli giallo e blu, ottieni me.", correct: "verde" },
    { text: "Se rimuovi il blu dal ciano, ottieni me (rosso primario sottrattivo).", correct: "verde" },
    { text: "Taglia il cavo del colore del deserto sabbioso.", correct: "giallo" },
    { text: "Taglia il cavo del colore del cielo notturno sereno.", correct: "blu" },
    { text: "Taglia il cavo del colore di una fragola matura.", correct: "rosso" },
    { text: "Taglia il cavo del colore di un lime aspro.", correct: "verde" },
    { text: "Sequenza di Fibonacci: Colore n.3 se Rosso=1, Blu=2, Verde=3.", correct: "verde" },
    { text: "Codice esadecimale #FF0000 corrisponde a quale cavo?", correct: "rosso" },
    { text: "Codice esadecimale #0000FF corrisponde a quale cavo?", correct: "blu" },
    { text: "Codice esadecimale #00FF00 corrisponde a quale cavo?", correct: "verde" },
    { text: "Codice esadecimale #FFFF00 corrisponde a quale cavo?", correct: "giallo" },
    { text: "Il cavo che rappresenta l'aria aperta e tersa.", correct: "blu" },
    { text: "Il cavo che rappresenta la ruggine del ferro.", correct: "rosso" },
    { text: "Il cavo che rappresenta l'energia nucleare nei fumetti.", correct: "verde" },
    { text: "Il cavo che rappresenta il tuono e la luce del limone.", correct: "giallo" },
    { text: "Disinnesco logico: Non sono freddo, non sono verde, non sono giallo.", correct: "rosso" },
    { text: "Disinnesco logico: Sono l'unico cavo freddo tra rosso, giallo e blu.", correct: "blu" },
    { text: "Quale filo ha lo stesso colore di una Ferrari classica?", correct: "rosso" },
    { text: "Quale filo ha lo stesso colore di un taxi di New York?", correct: "giallo" },
    { text: "Quale filo ha lo stesso colore delle divise della polizia postale?", correct: "blu" },
    { text: "Quale filo ha lo stesso colore di un prato all'inglese?", correct: "verde" },
    { text: "Ultimo test: Il codice della salvezza è il colore della rabbia.", correct: "rosso" },
    { text: "Ultimo test: Il codice della salvezza è il colore della speranza.", correct: "verde" },
    { text: "Ultimo test: Il codice della salvezza è il colore della gelosia.", correct: "giallo" }
];

// ==========================================
// 🪢 3. DATABASE 50 PAROLE PER IMPICCATO
// ==========================================
const HANGMAN_WORDS = [
    "DISCORD", "BOT", "PROGRAMMARE", "JAVASCRIPT", "GAMING", 
    "COMPUTER", "TASTIERA", "SCHERMO", "INTERNET", "SERVER", 
    "SVILUPPO", "CODICE", "FUNZIONE", "VARIABILE", "STRINGA", 
    "BOOLEANO", "ARRAY", "OGGETTO", "MEMORIA", "PROCESSORE", 
    "SCHEDA", "VIDEO", "AUDIO", "GIOCO", "SFIDA", 
    "VITTORIA", "SCONFITTA", "LIVELLO", "ESPERIENZA", "MONETE", 
    "INVENTARIO", "CRAFTING", "MINECRAFT", "PICCONE", "SPADA", 
    "DIAMANTE", "PIETRA", "LEGNO", "METALLO", "MAGIA", 
    "DRAGO", "CASTELLO", "EROE", "AVVENTURA", "MISSIONE", 
    "TESORO", "BAULE", "PORTALE", "GALASSIA", "UNIVERSO"
];

// ==========================================
// FUNZIONI DEI MINIGIOCHI
// ==========================================

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
        .setTitle('🧠 Quiz Arcade (50+ Domande)')
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
    let correctWire = rawRiddle.correct.toLowerCase();
    if (correctWire === "ross") correctWire = "rosso";

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
        .setTitle('💣 Artificiere (50+ Indovinelli)')
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

    co
