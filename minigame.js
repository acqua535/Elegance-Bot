// minigame.js - PARTE 1
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

// Mappa globale per l'Anti-Spam (traccia i giochi attivi degli utenti)
const activeGames = new Map();

// --- DATABASE 50+ QUIZ ---
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
    { q: "Quale oceano è il più grande?", options: ["Atlantico", "Indiano", "Artico", "Pacifico"], answer: "Pacifico" },
    { q: "Chi ha inventato il telefono?", options: ["Meucci", "Einstein", "Tesla", "Edison"], answer: "Meucci" },
    { q: "Qual è l'animale terrestre più veloce?", options: ["Leone", "Ghepardo", "Tigre", "Cavallo"], answer: "Ghepardo" },
    { q: "In quale paese si trovano le piramidi di Giza?", options: ["Messico", "Grecia", "Egitto", "Sudan"], answer: "Egitto" },
    { q: "Qual è il metallo liquido a temperatura ambiente?", options: ["Ferro", "Mercurio", "Piombo", "Zinco"], answer: "Mercurio" },
    { q: "Chi ha scoperto l'America?", options: ["Magellano", "Vasco da Gama", "Cristoforo Colombo", "Amerigo Vespucci"], answer: "Cristoforo Colombo" },
    { q: "Qual è la lingua più parlata al mondo per madrelingua?", options: ["Inglese", "Spagnolo", "Mandarino", "Hindi"], answer: "Mandarino" },
    { q: "Quanti bit ci sono in un byte?", options: ["4", "8", "16", "32"], answer: "8" },
    { q: "In che anno è iniziata la Prima Guerra Mondiale?", options: ["1914", "1939", "1918", "1945"], answer: "1914" },
    { q: "Qual è la capitale dell'Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: "Canberra" },
    { q: "Qual è il pianeta più grande del sistema solare?", options: ["Saturno", "Giove", "Nettuno", "Urano"], answer: "Giove" },
    { q: "Chi ha formulato la teoria della relatività?", options: ["Newton", "Galilei", "Einstein", "Hawking"], answer: "Einstein" },
    { q: "Qual è l'organo umano più esteso?", options: ["Fegato", "Cuore", "Pelle", "Polmoni"], answer: "Pelle" },
    { q: "In quale continente si trova il deserto del Sahara?", options: ["Asia", "Africa", "Australia", "Sud America"], answer: "Africa" },
    { q: "Qual è il simbolo chimico del ferro?", options: ["Fe", "Ir", "F", "Fr"], answer: "Fe" },
    { q: "Chi scrisse 'I Promessi Sposi'?", options: ["Leopardi", "Manzoni", "Pascoli", "Verga"], answer: "Manzoni" },
    { q: "Quanti tasti ha un pianoforte standard?", options: ["88", "64", "72", "96"], answer: "88" },
    { q: "Qual è la valuta ufficiale del Regno Unito?", options: ["Euro", "Dollaro", "Sterlina", "Franco"], answer: "Sterlina" },
    { q: "Quale gas compone la maggior parte dell'atmosfera terrestre?", options: ["Ossigeno", "Azoto", "Anidride carbonica", "Idrogeno"], answer: "Azoto" },
    { q: "Chi dipinse la Cappella Sistina?", options: ["Raffaello", "Caravaggio", "Michelangelo", "Giotto"], answer: "Michelangelo" },
    { q: "Qual è la catena montuosa più lunga del mondo?", options: ["Himalaya", "Ande", "Alpi", "Rocciose"], answer: "Ande" },
    { q: "In che anno è caduto il Muro di Berlino?", options: ["1989", "1991", "1985", "1993"], answer: "1989" },
    { q: "Qual è il fiume più lungo del mondo?", options: ["Rio delle Amazzoni", "Nilo", "Mississippi", "Yangtze"], answer: "Nilo" },
    { q: "Quanti giocatori compongono una squadra di calcio in campo?", options: ["9", "10", "11", "12"], answer: "11" },
    { q: "Qual è la capitale del Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: "Ottawa" },
    { q: "Quale fu il primo videogioco della storia (1958)?", options: ["Pong", "Tennis for Two", "Pac-Man", "Space Invaders"], answer: "Tennis for Two" },
    { q: "Chi ha inventato la lampadina a incandescenza commerciale?", options: ["Tesla", "Edison", "Bell", "Marconi"], answer: "Edison" },
    { q: "Qual è l'osso più lungo del corpo umano?", options: ["Omero", "Tibia", "Femore", "Radio"], answer: "Femore" },
    { q: "In quale città si trova il Colosseo?", options: ["Napoli", "Milano", "Roma", "Firenze"], answer: "Roma" },
    { q: "Qual è il simbolo chimico dell'acqua?", options: ["H2O", "CO2", "NaCl", "O2"], answer: "H2O" },
    { q: "Chi ha scritto '1984'?", options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "J.K. Rowling"], answer: "George Orwell" },
    { q: "Qual è il vulcano più alto d'Europa?", options: ["Vesuvio", "Etna", "Stromboli", "Hekla"], answer: "Etna" },
    { q: "Qual è il paese con più superficie al mondo?", options: ["Cina", "USA", "Canada", "Russia"], answer: "Russia" },
    { q: "Quale impero ha costruito il Colosseo?", options: ["Greco", "Romano", "Ottomano", "Persiano"], answer: "Romano" },
    { q: "Quante facce ha un cubo?", options: ["4", "6", "8", "12"], answer: "6" },
    { q: "Qual è la capitale della Germania?", options: ["Monaco", "Francoforte", "Berlino", "Amburgo"], answer: "Berlino" },
    { q: "Chi ha scoperto la penisola antartica?", options: ["Cook", "Amundsen", "Scott", "Bellingshausen"], answer: "Bellingshausen" },
    { q: "Qual è il mare più caldo del mondo?", options: ["Mar Rosso", "Mar Mediterraneo", "Mar Baltico", "Mar dei Caraibi"], answer: "Mar Rosso" },
    { q: "In che anno l'uomo ha calpestato per l'ultima volta la Luna?", options: ["1969", "1972", "1975", "1980"], answer: "1972" },
    { q: "Qual è il colore della bandiera della pace?", options: ["Bianca", "Arcobaleno", "Azzurra", "Verde"], answer: "Arcobaleno" },
    { q: "Qual è la città dei canali per eccellenza in Italia?", options: ["Venezia", "Milano", "Torino", "Bologna"], answer: "Venezia" }
];

// --- DATABASE 50+ INDOVINELLI BOMBA ---
const BOMB_WIRES_POOL = [
    { text: "Sono il colore del sangue e del fuoco. Tagliami se hai coraggio.", correct: "rosso" },
    { text: "Rappresento l'oceano profondo e la calma gelida.", correct: "blu" },
    { text: "Nasco unendo la luce del sole e il cielo. Sono la vita nei campi.", correct: "verde" },
    { text: "Sono l'oro dei folli e il colore del sole a mezzogiorno.", correct: "giallo" },
    { text: "Il mio colore ricorda la notte senza stelle e il carbone.", correct: "nero" },
    { text: "Rifletto la neve fresca e le nuvole nel cielo terso.", correct: "bianco" },
    { text: "Son color della terra bagnata dopo un forte temporale.", correct: "marrone" },
    { text: "Mi trovi nei tramonti infuocati e nei frutti succosi d'estate.", correct: "rosso" },
    { text: "Ricordo i mirtilli maturi e il cielo poco prima della tempesta.", correct: "blu" },
    { text: "Sono la freschezza di una foglia di menta appena colta.", correct: "verde" },
    { text: "Splendo come un limone acerbo sotto i raggi cocenti.", correct: "giallo" },
    { text: "Ricordo la grafite della matita sul foglio bianco.", correct: "nero" },
    { text: "Sono il candore delle nuvole più alte e soffici.", correct: "bianco" },
    { text: "Richiamo il legno antico delle vecchie porte di quercia.", correct: "marrone" },
    { text: "Il mio colore è quello dei pomodori maturi pronti per la salsa.", correct: "rosso" },
    { text: "Son l'azzurro intenso dei pavoni e delle pietre preziose.", correct: "blu" },
    { text: "Rappresento i prati sconfinati in primavera.", correct: "verde" },
    { text: "Brillo come il metallo prezioso dei faraoni egizi.", correct: "giallo" },
    { text: "Sono l'oscurità che avvolge la stanza quando spegni la luce.", correct: "nero" },
    { text: "Ricordo il latte fresco versato in una tazza di ceramica.", correct: "bianco" },
    { text: "Il mio colore è quello della cannella e del cioccolato fondente.", correct: "marrone" },
    { text: "Mi trovi nel cuore delle rose più belle e profumate.", correct: "rosso" },
    { text: "Sono il colore dei grandi abissi marini inesplorati.", correct: "blu" },
    { text: "Rappresento il muschio che cresce sul lato nord degli alberi.", correct: "verde" },
    { text: "Son la tinta calda delle spighe di grano pronte per la mietitura.", correct: "giallo" },
    { text: "Ricordo l'asfalto bagnato dalla pioggia estiva.", correct: "nero" },
    { text: "Sono il colore della schiuma creata dalle onde sulla battigia.", correct: "bianco" },
    { text: "Richiamo i castagni nei boschi durante la stagione autunnale.", correct: "marrone" },
    { text: "Il mio colore è quello delle ciliegie dolci e succose.", correct: "rosso" },
    { text: "Son l'infinito profondo dei cieli notturni estivi.", correct: "blu" },
    { text: "Rappresento il germoglio che buca la terra dopo il gelo.", correct: "verde" },
    { text: "Brillo nei girasoli che inseguono la luce del giorno.", correct: "giallo" },
    { text: "Sono il colore della pece e delle ombre più profonde.", correct: "nero" },
    { text: "Ricordo il sale marino sparso sulla roccia.", correct: "bianco" },
    { text: "Son color cuoio, robusto e resistente nel tempo.", correct: "marrone" },
    { text: "Mi trovi nel mantello delle coccinelle portafortuna.", correct: "rosso" },
    { text: "Sono il colore dei fiordalisi che crescono tra i campi.", correct: "blu" },
    { text: "Rappresento l'energia clorofilliana delle foreste pluviali.", correct: "verde" },
    { text: "Son la luce calda che filtra attraverso le persiane chiuse.", correct: "giallo" },
    { text: "Ricordo la roccia vulcanica dell'ossidiana tagliente.", correct: "nero" },
    { text: "Sono il colore del cotone appena raccolto nei campi.", correct: "bianco" },
    { text: "Richiamo il tronco nodoso di un ulivo millenario.", correct: "marrone" },
    { text: "Il mio colore ricorda le fiamme vive di un caminetto acceso.", correct: "rosso" },
    { text: "Son l'azzurro terso di un ghiacciaio millenario.", correct: "blu" },
    { text: "Rappresento il tè matcha servito nelle cerimonie tradizionali.", correct: "verde" },
    { text: "Brillo come lo zolfo puro estratto dalle viscere della terra.", correct: "giallo" },
    { text: "Sono l'assenza totale di luce in una grotta sotterranea.", correct: "nero" },
    { text: "Ricordo la porcellana fine dipinta a mano.", correct: "bianco" },
    { text: "Son color tabacco stagionato nelle antiche cantine.", correct: "marrone" },
    { text: "Mi trovi nel colore delle vesti dei pompieri in azione.", correct: "rosso" }
];

// --- DATABASE 50+ PAROLE IMPICCATO ---
const HANGMAN_WORDS = [
    "DISCORD", "BOT", "PROGRAMMARE", "JAVASCRIPT", "GAMING", "COMPUTER", "SERVER", "CODICE",
    "SVILUPPATORE", "TASTIERA", "SCHERMO", "INTERNET", "FUNZIONE", "VARIABILE", "STRINGA",
    "ARRAY", "OGGETTO", "DATABASE", "MODULO", "CLIENT", "CANALE", "MESSAGGIO", "RUOLO",
    "PERMESSO", "COMANDO", "INTERAZIONE", "EMBED", "PULSANTE", "MENU", "SICUREZZA",
    "PROMETEO", "ALGORITMO", "SISTEMA", "PROGETTO", "ARCHIVIO", "RETRO", "FUTURO", "DIGITALE",
    "TECNOLOGIA", "HARDWARE", "SOFTWARE", "MEMORIA", "PROCESSORE", "SCHEDA", "RETE", "FIREWALL",
    "CRITTOGRAFIA", "BACKUP", "UPDATE", "TERMINALE", "CONSOLE", "STREAMING", "VIRTUALE", "GIGAHERTZ"
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
                ephemeral: true 
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

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
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
            console.error(error);
            activeGames.delete(userId);
        }
    }
};

// [Aspetto la tua conferma o il segnale per mandarti la Parte 2 con le funzioni dei singoli giochi!]

// minigame.js - PARTE 2

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
        if (i.user.id !== userId) return i.reply({ content: "Questo minigioco non è per te!", ephemeral: true });

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
        if (i.user.id !== userId) return i.reply({ content: "Non toccare la bomba altrui!", ephemeral: true });

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
        await interaction.editReply({ content: "🔢 **Tocca a te!** Inserisci la sequenza esatta:", components: [row] });
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

        await interaction.editReply({ content: "🚨 **VIA! Premi il pulsante!**", components: [activeRow] });
        const startTime = Date.now();

        const collector = msg.createMessageComponentCollector({ time: 5000 });
        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: "Non bruciare la mossa!", ephemeral: true });

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

    const getRow = () => new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('hangman_letter')
            .setPlaceholder('Scegli una lettera')
            .addOptions("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').slice(0, 25).map(l => ({ label: l, value: l })))
    );

    const embed = new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('🪢 Impiccato Tech')
        .setDescription(`Parola:\n# ${getWordDisplay()}\n\nErrori: **${errors}/${maxErrors}**`);

    await interaction.update({ content: null, embeds: [embed], components: [getRow()] });
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 30000 });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return i.reply({ content: "Non è il tuo turno!", ephemeral: true });

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
            const updatedEmbed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle('🪢 Impiccato Tech')
                .setDescription(`Parola:\n# ${getWordDisplay()}\n\nLettere: ${guessedLetters.join(', ')}\nErrori: **${errors}/${maxErrors}**`);
            
            await i.update({ embeds: [updatedEmbed], components: [getRow()] });
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
