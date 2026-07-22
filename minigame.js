// ==========================================
// FILE: minigame.js - PARTE 1 (FIXXATA)
// ==========================================
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

const activeGames = new Map();

// Helper per i premi estetici
function getRandomReward(minCoins = 10, maxCoins = 50, minXp = 20, maxXp = 100) {
    const coins = Math.floor(Math.random() * (maxCoins - minCoins + 1)) + minCoins;
    const xp = Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;
    return `\n\n🎁 **Ricompensa:** +${coins} 🪙 Monete | +${xp} ✨ XP`;
}

// --- DATABASE QUIZ (50+ DOMANDE) ---
const QUIZ_QUESTIONS = [
    // Scienza & Spazio
    { q: "Qual è il pianeta più vicino al Sole?", options: ["Venere", "Mercurio", "Marte", "Terra"], answer: "Mercurio" },
    { q: "Qual è l'elemento chimico con simbolo 'Au'?", options: ["Argento", "Rame", "Oro", "Alluminio"], answer: "Oro" },
    { q: "Qual è il pianeta più grande del sistema solare?", options: ["Saturno", "Giove", "Nettuno", "Urano"], answer: "Giove" },
    { q: "Qual è il gas più abbondante nell'atmosfera terrestre?", options: ["Ossigeno", "Anidride Carbonica", "Azoto", "Idrogeno"], answer: "Azoto" },
    { q: "Quale organo del corpo umano consuma più energia?", options: ["Cuore", "Cervello", "Fegato", "I polmoni"], answer: "Cervello" },
    { q: "Qual è la velocità della luce nel vuoto?", options: ["300.000 km/s", "150.000 km/s", "1.000.000 km/s", "30.000 km/s"], answer: "300.000 km/s" },
    { q: "Qual è il metallo più denso conosciuto?", options: ["Piombo", "Osmio", "Oro", "Uranio"], answer: "Osmio" },
    { q: "Chi ha scoperto la penicillina?", options: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Robert Koch"], answer: "Alexander Fleming" },
    { q: "Qual è la formula chimica dell'ozono?", options: ["O2", "O3", "CO2", "H2O"], answer: "O3" },
    { q: "Quante ossa ci sono nel corpo umano adulto?", options: ["206", "210", "180", "300"], answer: "206" },

    // Informatica & Tech
    { q: "Cosa significa l'acronimo 'RAM'?", options: ["Random Access Memory", "Read Access Method", "Rapid Application Mode", "Real Action System"], answer: "Random Access Memory" },
    { q: "In che anno è nato il World Wide Web?", options: ["1989", "1995", "1978", "2001"], answer: "1989" },
    { q: "Chi è considerato il padre dell'informatica moderna?", options: ["Steve Jobs", "Alan Turing", "Bill Gates", "Ada Lovelace"], answer: "Alan Turing" },
    { q: "Quale linguaggio di programmazione usa il simbolo '#C'?", options: ["C++", "C#", "Python", "Java"], answer: "C#" },
    { q: "Cosa significa 'HTTP'?", options: ["HyperText Transfer Protocol", "High Transfer Text Process", "Hyper Tech Test Program", "Home Text Transfer Page"], answer: "HyperText Transfer Protocol" },
    { q: "Quale azienda ha creato il sistema operativo Android?", options: ["Apple", "Android Inc.", "Google", "Microsoft"], answer: "Android Inc." },
    { q: "Qual è il valore binario del numero decimale 5?", options: ["101", "110", "011", "111"], answer: "101" },
    { q: "In Javascript, qual è il tipo di dato di `NaN`?", options: ["Number", "String", "Undefined", "Null"], answer: "Number" },
    { q: "Cosa fa la porta 80 di default?", options: ["HTTP", "HTTPS", "FTP", "SSH"], answer: "HTTP" },
    { q: "Chi ha fondato la Microsoft insieme a Bill Gates?", options: ["Steve Wozniak", "Paul Allen", "Larry Page", "Tim Berners-Lee"], answer: "Paul Allen" },

    // Storia & Geografia
    { q: "In quale anno è sbarcato l'uomo sulla Luna?", options: ["1965", "1969", "1972", "1980"], answer: "1969" },
    { q: "Qual è il fiume più lungo del mondo?", options: ["Nilo", "Río delle Amazzoni", "Mississippi", "Yangtze"], answer: "Río delle Amazzoni" },
    { q: "Qual è la capitale dell'Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], answer: "Canberra" },
    { q: "Chi fu il primo imperatore romano?", options: ["Giulio Cesare", "Augusto", "Nerone", "Marco Aurelio"], answer: "Augusto" },
    { q: "In che anno è caduto il Muro di Berlino?", options: ["1989", "1991", "1985", "1975"], answer: "1989" },
    { q: "Quale nazione ha la bandiera con un acero rosso?", options: ["Canada", "Norvegia", "Austria", "Giappone"], answer: "Canada" },
    { q: "Dove si trova lo stretto di Gibilterra?", options: ["Tra Spagna e Marocco", "Tra Italia e Grecia", "Tra Francia e Inghilterra", "Tra Egitto e Arabia"], answer: "Tra Spagna e Marocco" },
    { q: "Qual è il paese più piccolo del mondo per superficie?", options: ["Monaco", "Città del Vaticano", "San Marino", "Liechtenstein"], answer: "Città del Vaticano" },
    { q: "In quale città si trova la sede dell'ONU?", options: ["Ginevra", "New York", "Washington D.C.", "Bruxelles"], answer: "New York" },
    { q: "Chi comandava la flotta nella battaglia di Trafalgar?", options: ["Napoleone", "Horatio Nelson", "Wellington", "Drake"], answer: "Horatio Nelson" },

    // Arte, Cultura & Spettacolo
    { q: "Chi ha dipinto la Gioconda?", options: ["Michelangelo", "Leonardo da Vinci", "Raffaello", "Donatello"], answer: "Leonardo da Vinci" },
    { q: "Chi ha scritto la 'Divina Commedia'?", options: ["Petrarca", "Boccaccio", "Dante Alighieri", "Manzoni"], answer: "Dante Alighieri" },
    { q: "In quale museo si trova il quadro 'La Notte Stellata' di Van Gogh?", options: ["Louvre", "MoMA", "National Gallery", "Prado"], answer: "MoMA" },
    { q: "Quanti tasti ha un pianoforte standard?", options: ["88", "76", "92", "80"], answer: "88" },
    { q: "Chi ha composto le 'Quattro Stagioni'?", options: ["Bach", "Mozart", "Vivaldi", "Beethoven"], answer: "Vivaldi" },
    { q: "Quale film ha vinto il primo Oscar al miglior film d'animazione?", options: ["Shrek", "Toy Story", "Il re leone", "La bella e la bestia"], answer: "Shrek" },
    { q: "Chi ha scritto l'opera 'Romeo e Giulietta'?", options: ["Charles Dickens", "William Shakespeare", "Oscar Wilde", "Mark Twain"], answer: "William Shakespeare" },
    { q: "Qual è la lingua madre più parlata al mondo?", options: ["Inglese", "Spagnolo", "Cinese Mandarino", "Hindi"], answer: "Cinese Mandarino" },
    { q: "Chi ha scolpito il 'David' di marmo a Firenze?", options: ["Bernini", "Michelangelo", "Donatello", "Canova"], answer: "Michelangelo" },
    { q: "Qual è l'opera teatrale più lunga di Shakespeare?", options: ["Amleto", "Macbeth", "Otello", "Re Lear"], answer: "Amleto" },

    // Gaming & Pop Culture
    { q: "Qual è il gioco più venduto di tutti i tempi?", options: ["Tetris", "Minecraft", "GTA V", "Wii Sports"], answer: "Minecraft" },
    { q: "In quale anno è stato rilasciato il primo Pokémon Rosso/Blu in Giappone?", options: ["1996", "1998", "2000", "1995"], answer: "1996" },
    { q: "Come si chiama il protagonista della saga di 'The Legend of Zelda'?", options: ["Zelda", "Link", "Ganon", "Epona"], answer: "Link" },
    { q: "Quale casa di sviluppo ha creato 'The Witcher 3'?", options: ["Bethesda", "CD Projekt Red", "Ubisoft", "Bioware"], answer: "CD Projekt Red" },
    { q: "Qual è la mossa finale di Ryu in Street Fighter?", options: ["Hadoken", "Shoryuken", "Tatsumaki", "Kamehameha"], answer: "Shoryuken" },
    { q: "In Half-Life, qual è l'arma iconica di Gordon Freeman?", options: ["Pistola 9mm", "Piede di porco", "Fucile a pompa", "Pistola Gravitazionale"], answer: "Piede di porco" },
    { q: "Come si chiama l'IA antagonista principale di Portal?", options: ["HAL 9000", "GLaDOS", "Cortana", "SHODAN"], answer: "GLaDOS" },
    { q: "Qual è il nome del mondo in cui è ambientato 'World of Warcraft'?", options: ["Azeroth", "Teyvat", "Tamriel", "Sanctuary"], answer: "Azeroth" },
    { q: "Chi è l'ideatore della serie 'Metal Gear'?", options: ["Shigeru Miyamoto", "Hideo Kojima", "Gabe Newell", "Todd Howard"], answer: "Hideo Kojima" },
    { q: "Come si chiama la mascotte originale di SEGA?", options: ["Sonic", "Alex Kidd", "Tails", "Shinobi"], answer: "Alex Kidd" }
];

// --- DATABASE INDOVINELLI BOMBA (SOLO: ROSSO, BLU, VERDE, GIALLO) ---
const BOMB_WIRES_POOL = [
    // ROSSI
    { text: "Sono il fuoco, il pericolo sul semaforo e la passione nel cuore. Non bruciarti.", correct: "rosso" },
    { text: "Il pianeta desolato porta il mio nome, così come il primo colore dell'arcobaleno.", correct: "rosso" },
    { text: "Mi trovi nel rubino e nelle fragole mature, ma sono anche il colore della rabbia.", correct: "rosso" },
    { text: "Ho la stessa tinta del sangue, del magma in eruzione e del cavallo Ferrari.", correct: "rosso" },
    { text: "Se mi unisci al blu formo il viola, ma da solo rappresento l'allarme generale.", correct: "rosso" },

    // BLU
    { text: "Rappresento l'oceano profondo, la calma gelida e il cielo sereno di giorno.", correct: "blu" },
    { text: "I nobili si vantano di avermi nelle vene, e gli zaffiri ne vanno fieri.", correct: "blu" },
    { text: "Uniscimi al giallo se desideri la vegetazione, ma da solo rimango freddo come il ghiaccio.", correct: "blu" },
    { text: "Sono il colore della notte profonda prima del buio e del gigante d'acqua Neptune.", correct: "blu" },
    { text: "Mi vedi sui tasti dei social networks più famosi e nella maglia della nazionale italiana.", correct: "blu" },

    // VERDI
    { text: "Nasco unendo la luce del sole (giallo) al mare profondo (blu). Sono la vita nei campi.", correct: "verde" },
    { text: "Sono lo smeraldo prezioso, l'invidia che brucia e il via sul semaforo.", correct: "verde" },
    { text: "Tutti gli alberi della foresta indossano il mio abito a primavera.", correct: "verde" },
    { text: "Il veleno nelle storie ha spesso la mia sfumatura, così come le lucertole e i rospi.", correct: "verde" },
    { text: "Se mi cerchi sulla terra, guarda la raganella, la menta e i quadrifogli porta fortuna.", correct: "verde" },

    // GIALLI
    { text: "Sono l'oro dei folli, il colore del sole a mezzogiorno e dei girasoli estivi.", correct: "giallo" },
    { text: "Sotto la mia luce il limone inasprisce e le api portano le loro strisce nere.", correct: "giallo" },
    { text: "Mettimi tra il rosso e il verde al semaforo: ti avverto che devi rallentare!", correct: "giallo" },
    { text: "Sono la sabbia del deserto, la paglia secca e il tuorlo dell'uovo.", correct: "giallo" },
    { text: "Illumino la notte quando guardi la Luna, e formo il verde se entro nel blu.", correct: "giallo" }
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
                { label: '🧠 Quiz Arcade (50+ Domande)', description: 'Metti alla prova la tua cultura generale', value: 'play_quiz' },
                { label: '💣 Artificiere (4 Cavi)', description: 'Disinnesca la bomba risolvendo l’enigma', value: 'play_bomb' },
                { label: '🔢 Memoria Pro', description: 'Memorizza la sequenza di numeri casuali', value: 'play_memory' },
                { label: '⚡ Reazione Fulminea', description: 'Premi il tasto più veloce di tutti', value: 'play_reaction' },
                { label: '🪢 Impiccato Tech + Indizi', description: 'Indovina la parola segreta aiutandoti con l\'indizio', value: 'play_hangman' },
                { label: '🎰 Ruota della Fortuna', description: 'Fai girare la ruota e vinci premi in Monete/XP', value: 'play_wheel' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('🎮 Arcade & Minigames Hub')
            .setDescription('Benvenuto nel centro giochi ufficiale!\nSeleziona un minigioco dal menu per iniziare e guadagnare **Monete** e **XP**!\n\n*Nota: Puoi giocare a un solo minigioco alla volta.*');

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
// FUNZIONI DEI MINIGIOCHI (PARTE 1)
// ==========================================

async function startQuiz(interaction) {
    const userId = interaction.user.id;
    const randomQ = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];

    const row = new ActionRowBuilder().addComponents(
        randomQ.options.map((opt, idx) => 
            new ButtonBuilder()
                .setCustomId(`quiz_${opt === randomQ.answer ? 'correct' : 'wrong'}_${idx}`)
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
        if (i.customId.startsWith('quiz_correct')) {
            const reward = getRandomReward(25, 60, 40, 120);
            await i.update({ content: `✅ **Risposta esatta!** Complimenti!${reward}`, embeds: [], components: [] });
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

    // RIGOROSAMENTE I 4 COLORI
    const wires = ['rosso', 'blu', 'verde', 'giallo'];
    
    // Mappatura stili estetici dei pulsanti Discord
    const buttonStyles = {
        rosso: ButtonStyle.Danger,
        blu: ButtonStyle.Primary,
        verde: ButtonStyle.Success,
        giallo: ButtonStyle.Secondary
    };

    const row = new ActionRowBuilder().addComponents(
        wires.map(w => 
            new ButtonBuilder()
                .setCustomId(`bomb_${w}`)
                .setLabel(`Taglia ${w.toUpperCase()}`)
                .setStyle(buttonStyles[w])
        )
    );

    const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('💣 Artificiere')
        .setDescription(`📜 **Indovinello:**\n*"${rawRiddle.text}"*\n\nTaglia il cavo giusto tra Rosso, Blu, Verde e Giallo (12 secondi)!`);

    await interaction.update({ content: null, embeds: [embed], components: [row] });
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 12000 });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return i.reply({ content: "Non toccare la bomba altrui!", flags: 64 });

        activeGames.delete(userId);
        const chosenWire = i.customId.replace('bomb_', '');
        if (chosenWire === correctWire) {
            const reward = getRandomReward(40, 90, 80, 180);
            await i.update({ content: `🎉 **BOOM EVITATO!** Hai tagliato il cavo corretto (**${correctWire.toUpperCase()}**).${reward}`, embeds: [], components: [] });
        } else {
            await i.update({ content: `💥 **KABOOOM!** Hai tagliato il cavo **${chosenWire.toUpperCase()}**, ma quello corretto era il **${correctWire.toUpperCase()}**!`, embeds: [], components: [] });
        }
        collector.stop();
    });

    collector.on('end', async collected => {
        if (collected.size === 0) {
            activeGames.delete(userId);
            await interaction.editReply({ content: "💥 **KABOOOM!** Tempo scaduto, la bomba è esplosa!", embeds: [], components: [] }).catch(() => {});
        }
    });
     }

// ==========================================
// FILE: minigame.js - PARTE 2
// ==========================================

// --- DATABASE IMPICCATO (CON INDIZI) ---
const HANGMAN_WORDS = [
    { word: "DISCORD", hint: "La piattaforma VoIP su cui ci troviamo adesso" },
    { word: "JAVASCRIPT", hint: "Il linguaggio di programmazione usato per questo bot" },
    { word: "PYTHON", hint: "Linguaggio famoso per la sua sintassi semplice e il logo a serpente" },
    { word: "DATABASE", hint: "Archivio strutturato dove si salvano i dati permanentemente" },
    { word: "ALGORITMO", hint: "Sequenza finita di istruzioni per risolvere un problema" },
    { word: "HARDWARE", hint: "La componente fisica e tangibile di un computer" },
    { word: "SOFTWARE", hint: "I programmi e le applicazioni che girano sul computer" },
    { word: "BACKEND", hint: "La parte del codice che gestisce la logica lato server" },
    { word: "FRONTEND", hint: "L'interfaccia grafica con cui l'utente interagisce direttamente" },
    { word: "FIREWALL", hint: "Sistema di sicurezza che controlla il traffico di rete" },
    { word: "INTERNET", hint: "La rete globale di calcolatori interconnessi" },
    { word: "TASTIERA", hint: "Periferica di input usata per digitare" },
    { word: "PROCESSORE", hint: "Il 'cervello' principale del computer (CPU)" },
    { word: "MEMORIA", hint: "Spazio di archiviazione temporaneo o permanente" },
    { word: "SERVER", hint: "Elaboratore che fornisce servizi ad altri computer chiamati client" }
];

async function startMemory(interaction) {
    const userId = interaction.user.id;
    // Genera una sequenza casuale di 5 numeri da 1 a 5
    const sequence = Array.from({ length: 5 }, () => Math.floor(Math.random() * 5) + 1);
    
    await interaction.update({ 
        content: `🧠 **Memorizza la sequenza di 5 cifre:**\n# ➡️ ${sequence.join(' - ')}\n\n*Hai 4 secondi prima che scompaia...*`, 
        embeds: [], 
        components: [] 
    });

    setTimeout(async () => {
        const row = new ActionRowBuilder().addComponents(
            [1, 2, 3, 4, 5].map(n => new ButtonBuilder().setCustomId(`mem_${n}`).setLabel(n.toString()).setStyle(ButtonStyle.Secondary))
        );

        let userGuess = [];
        await interaction.editReply({ content: "🔢 **Tocca a te!** Inserisci la sequenza esatta premendo i tasti:", components: [row] }).catch(() => {});
        const msg = await interaction.fetchReply();
        
        const filter = i => i.user.id === userId;
        const collector = msg.createMessageComponentCollector({ filter, time: 20000 });

        collector.on('collect', async i => {
            userGuess.push(parseInt(i.customId.replace('mem_', '')));

            if (userGuess.length === sequence.length) {
                collector.stop();
                activeGames.delete(userId);
                if (userGuess.every((val, idx) => val === sequence[idx])) {
                    const reward = getRandomReward(35, 75, 50, 150);
                    await i.update({ content: `🏆 **Corretto! Memoria di ferro!**${reward}`, components: [] });
                } else {
                    await i.update({ content: `❌ **Errata!** La sequenza corretta era: **${sequence.join(' - ')}**`, components: [] });
                }
            } else {
                await i.update({ content: `🔢 Sequenza inserita: **${userGuess.join(' - ')}** ... Continua!`, components: [row] });
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

    await interaction.update({ content: "⚡ **Preparati...** Attendi il segnale verde!", embeds: [], components: [row] });
    const msg = await interaction.fetchReply();
    const randomDelay = Math.floor(Math.random() * 3500) + 2000;

    setTimeout(async () => {
        const activeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('react_btn_active').setLabel('PREMI ORA!').setStyle(ButtonStyle.Success)
        );

        await interaction.editReply({ content: "🚨 **VIA! PREMI IL PULSANTE!**", components: [activeRow] }).catch(() => {});
        const startTime = Date.now();

        const collector = msg.createMessageComponentCollector({ time: 5000 });
        collector.on('collect', async i => {
            if (i.user.id !== userId) return i.reply({ content: "Non bruciare la mossa!", flags: 64 });

            activeGames.delete(userId);
            const reactionTime = Date.now() - startTime;
            collector.stop();

            let reward = "";
            if (reactionTime < 350) reward = getRandomReward(50, 100, 100, 250);
            else reward = getRandomReward(15, 40, 30, 80);

            await i.update({ content: `⚡ **Fulmineo!** Hai risposto in **${reactionTime} ms**!${reward}`, components: [] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                activeGames.delete(userId);
                interaction.editReply({ content: "🐢 **Tempo scaduto!** Sei stato troppo lento.", components: [] }).catch(() => {});
            }
        });
    }, randomDelay);
}

async function startHangman(interaction) {
    const userId = interaction.user.id;
    const target = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    const word = target.word;
    const hint = target.hint;

    let guessedLetters = [];
    let errors = 0;
    const maxErrors = 6;

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
                .setPlaceholder('🔤 Scegli una lettera dal menu')
                .addOptions(availableLetters.map(l => ({ label: l, value: l })))
        );
    }

    const initialRow = getHangmanMenu();
    const embed = new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('🪢 Impiccato Tech')
        .setDescription(`Parola:\n# ${getWordDisplay()}\n\n💡 **Indizio:** *${hint}*\n\nErrori: **${errors}/${maxErrors}**`);

    await interaction.update({ content: null, embeds: [embed], components: [initialRow] });
    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({ time: 90000 });

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
            const reward = getRandomReward(30, 80, 60, 160);
            await i.update({ content: `🎉 **Vittoria!** La parola era **${word}**!${reward}`, embeds: [], components: [] });
        } else if (lost) {
            activeGames.delete(userId);
            collector.stop();
            await i.update({ content: `💀 **Game Over!** Hai esaurito i tentativi. La parola era **${word}**.`, embeds: [], components: [] });
        } else {
            const nextRow = getHangmanMenu();
            const updatedEmbed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle('🪢 Impiccato Tech')
                .setDescription(`Parola:\n# ${getWordDisplay()}\n\n💡 **Indizio:** *${hint}*\n\nLettere provate: ${guessedLetters.join(', ')}\nErrori: **${errors}/${maxErrors}**`);
            
            await i.update({ embeds: [updatedEmbed], components: nextRow ? [nextRow] : [] });
        }
    });

    collector.on('end', async collected => {
        if (collected.size === 0) {
            activeGames.delete(userId);
            await interaction.editReply({ content: `⏰ **Tempo scaduto!** La parola era **${word}**.`, embeds: [], components: [] }).catch(() => {});
        }
    });
}

async function startWheel(interaction) {
    const userId = interaction.user.id;
    const outcomes = [
        { label: "Sfortuna... niente vincita stavolta! ❌", coins: 0, xp: 5 },
        { label: "Piccola Vincita! 🪙", coins: 20, xp: 20 },
        { label: "Media Vincita! 💰", coins: 50, xp: 50 },
        { label: "GRANDE JACKPOT! 🎰💎", coins: 150, xp: 200 }
    ];

    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    let rewardText = "";
    if (result.coins > 0) {
        rewardText = `\n\n🎁 **Ricompensa:** +${result.coins} 🪙 Monete | +${result.xp} ✨ XP`;
    } else {
        rewardText = `\n\n✨ **XP di consolazione:** +${result.xp} XP`;
    }

    const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('🎰 Ruota della Fortuna')
        .setDescription(`La ruota ha girato ed è arrivata su:\n\n### ${result.label}${rewardText}`);

    activeGames.delete(userId);
    await interaction.update({ content: null, embeds: [embed], components: [] });
        }
