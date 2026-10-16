const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder, 
    ActionRowBuilder, 
    MessageFlags
} = require("discord.js");

// Array con le 20 storie horror dettagliate
const storie = [
    {
        id: "storia_1",
        label: "1. Il Server Fantasma",
        emoji: "👻",
        titolo: "👻 Il Server Fantasma",
        testo: "Era la notte del 31 Ottobre quando Marco, un moderatore stanco, scoprì un server Discord mai visto prima tra i suoi canali. Non ricordava di essere entrato, né c'erano link d'invito nei suoi messaggi. La lista utenti era completamente vuota, eppure nei canali testuali continuavano a comparire messaggi cancellati una frazione di secondo dopo essere stati inviati.\n\nIncuriosito, si unì all'unico canale vocale presente: '#Oltretomba'. Appena entrò, un silenzio di tomba avvolse le sue cuffie, seguito da un leggero respiro metallico. Un utente chiamato 'Sconosciuto' entrò nella vocale senza fare alcun suono. All'improvviso, la webcam di Marco si accese da sola e la spia verde iniziò a lampeggiare. Sullo schermo di Discord apparve una condivisione video... che mostrava la stanza di Marco ripresa esattamente da dietro la sua sedia."
    },
    {
        id: "storia_2",
        label: "2. La Chiamata delle 03:00",
        emoji: "📞",
        titolo: "📞 La Chiamata delle 03:00",
        testo: "La stanza era illuminata solo dal bagliore del monitor. Mezzanotte era passata da un pezzo e le 03:00 in punto scattarono sull'orologio digitale. In quel preciso istante, il telefono di Alex sul tavolo iniziò a vibrare fortissimo. Il display mostrava una chiamata in arrivo dal suo stesso numero telefonico.\n\nPensando a uno scherzo di pessimo gusto di qualche bot telemarketing, Alex rispose per insultare chiunque ci fosse dall'altra parte. Ma non appena accostò il telefono all'orecchio, sentì la propria voce, registrata con agghiacciante nitidezza, che sussurrava: 'Non girarti verso la finestra. Non guardare il riflesso sul monitor. E soprattutto... fai finta di non avermi sentito respirare sotto il tuo letto'."
    },
    {
        id: "storia_3",
        label: "3. Il Bug che Sanguina",
        emoji: "🩸",
        titolo: "🩸 Il Bug che Sanguina",
        testo: "Un programmatore stava lavorando fino a tardi per sistemare un bug critico nel codice del bot del server. Più tentava di correggere la sintassi, più il terminale restituiva errori incomprensibili scritti in caratteri sconosciuti. Alla cinquantesima compilazione fallita, il monitor principale iniziò a sfarfallare in modo anomalo.\n\nDagli angoli dello schermo LCD iniziò a colare un liquido denso, scuro e dall'inconfondibile odore ferroso di sangue fresco. Il fluido gocciolava lentamente sulla tastiera meccanica, facendo premere i tasti da solo. Sullo schermo apparve una riga finale di codice non cancellabile: `system.fatalError: L'anima dell'utente è stata sovrascritta con successo`."
    },
    {
        id: "storia_4",
        label: "4. L'Avatar Scomparso",
        emoji: "👤",
        titolo: "👤 L'Avatar Scomparso",
        testo: "Da qualche settimana, un utente di nome Leo notò qualcosa di strano nell'avatar di un suo vecchio amico di giochi, offline da ormai due mesi. L'immagine del profilo mostrava un corridoio buio con una figura sfuocata sullo sfondo. Ogni giorno che passava, la figura nell'avatar sembrava muoversi e ingrandirsi, come se stesse camminando verso l'obiettivo.\n\nUna sera di pioggia, Leo guardò di nuovo la lista amici: l'avatar era diventato totalmente vuoto. La figura era sparita dalla foto. Un secondo dopo, la luce di casa sua saltò improvvisamente, lasciando la stanza nel buio pesto. Dal corridoio reale di casa sua, risuonarono dei passi bagnati che avanzavano verso la sua porta."
    },
    {
        id: "storia_5",
        label: "5. Il Canale Vocale #666",
        emoji: "🎙️",
        titolo: "🎙️ Il Canale Vocale #666",
        testo: "Tra i membri del server girava una leggenda urbana: se ti colleghi da solo a un canale vocale ed esegui una precisa combinazione di comandi dopo mezzanotte, appare un canale nascosto chiamato '#666'. Un utente scettico volle fare la prova in diretta per smentire la storia davanti ai suoi amici.\n\nEseguì i comandi e, contro ogni aspettativa, il canale comparve. Si spostò all'interno ridendo, ma la sua trasmissione si bloccò immediatamente per tutti gli altri utenti. Chi era in ascolto dagli altri canali giurò di aver sentito urla disperate mescolate a interferenze stridenti. L'utente venne disconnesso da Discord e il suo account risultò eliminato pochi minuti dopo. Nessuno lo ha più visto online."
    },
    {
        id: "storia_6",
        label: "6. La Notifica Senza Nome",
        emoji: "🔔",
        titolo: "🔔 La Notifica Senza Nome",
        testo: "Il classico suono del ping di Discord echeggiò nella stanza silenziosa. Luca sbloccò lo schermo pronto a leggere il solito messaggio della community, ma nella barra delle notifiche non c'era nessun distintivo rosso, nessun canale evidenziato e nessun messaggio privato non letto.\n\nIl ping risuonò una seconda volta, poi una terza, diventando sempre più forte e distorto fino a far tremare le casse del PC. Sullo schermo apparve una finestra di dialogo di sistema priva di tasto 'Chiudi'. Il testo recitava: 'Non è una notifica di Discord. È il segnale che siamo riusciti ad aprire la porta del tuo microfono. Riesci a sentirci mentre parliamo a pochi centimetri dal tuo orecchio?'."
    },
    {
        id: "storia_7",
        label: "7. Lo Stream dell'Oltretomba",
        emoji: "📹",
        titolo: "📹 Lo Stream dell'Oltretomba",
        testo: "Durante una maratona di streaming su Twitch per Halloween, uno streamer molto seguito stava giocando ad un horror indipendente. La chat stava viaggiando a mille all'ora, quando improvvisamente i messaggi iniziarono a rallentare. Tutti gli spettatori scrivevano la stessa identica cosa: 'CHI È QUELLA PERSONA DIETRO DITE?'.\n\nLo streamer sorrise pensando a uno scherzo coordinato della community e guardò la sua webcam nella schermata di anteprima. Riflessa nelle lenti dei suoi occhiali, c'era un'alta figura priva di volto, totalmente nera, china sulla sua spalla. Prima che potesse girarsi o staccare la spina della corrente, lo stream si oscurò e gli altoparlanti riprodussero un risucchio soffocato."
    },
    {
        id: "storia_8",
        label: "8. Il Bot Posseduto",
        emoji: "🤖",
        titolo: "🤖 Il Bot Posseduto",
        testo: "Dopo un aggiornamento inaspettato spinto sul server, il bot principale per la gestione della community smise di rispondere ai soliti comandi slash. Invece di inviare i soliti messaggi di benvenuto, cominciò a generare autonomamente messaggi Embed dal colore rosso sangue.\n\nI messaggi contenerevano informazioni riservate, segreti personali e persino gli indirizzi reali di casa dei membri presenti online in quel momento. Quando gli Owner provarono ad espellere il bot dal server, il bot inviò un ultimo messaggio in chat generale: 'Non potete cacciarmi da un posto che ho già trasformato nella mia nuova dimora'. Subito dopo, i permessi di tutti gli admin vennero revocati."
    },
    {
        id: "storia_9",
        label: "9. La Foto nella Galleria",
        emoji: "🖼️",
        titolo: "🖼️ La Foto nella Galleria",
        testo: "Per mostrare la sua nuova postazione da gaming illuminata dai LED viola, un ragazzo scattò una foto veloce con lo smartphone da inviare nella chat del server. Inoltrò l'immagine senza guardarla troppo, ma dopo pochi secondi gli utenti in chat iniziarono a tempestarlo di domande.\n\nIngrandendo lo scatto inviato, notò che nell'angolo più scuro della stanza, proprio di fianco al case del computer, si vedeva chiaramente una mano pallida, deforme e dalle unghie lunghe appoggiata sulla scrivania. Con il cuore in gola, abbassò lo sguardo dallo schermo del telefono verso il punto esatto della scrivania..."
    },
    {
        id: "storia_10",
        label: "10. Il Ping alle 03:33",
        emoji: "⏱️",
        titolo: "⏱️ Il Ping alle 03:33",
        testo: "Esattamente alle 03:33 di notte, un bip acuto ruppe il silenzio. Un messaggio privato arrivò da un account senza avatar, il cui nickname era una sequenza casuale di numeri e simboli sbarrati.\n\nIl messaggio conteneva un file audio di 5 secondi e una riga di testo: 'So cosa fai quando credi che nessuno ti stia guardando'. Premendo play sul file audio, il ragazzo non sentì rumori di fondo o musica, ma la registrazione perfetta dei suoi respiri e dei suoi colpi di tosse ripresi dai sensori di casa sua negli ultimi 10 minuti."
    },
    {
        id: "storia_11",
        label: "11. Lo Specchio Digitale",
        emoji: "🪞",
        titolo: "🪞 Lo Specchio Digitale",
        testo: "Mentre testava la resa visiva della sua nuova fotocamera 4K, un dev notò un ritardo impercettibile tra i suoi movimenti reali e la risposta dell'immagine sullo schermo. Fece una prova: alzò la mano destra di fronte al sensore.\n\nLa sua immagine sullo schermo rimase immobile per due lunghi secondi. Poi, con lentezza innaturale, il suo doppio digitale alzò la mano sinistra, inclino la testa verso il basso e sfoderò un sorriso deforme da un orecchio all'altro. L'immagine nel monitor mormorò senza audio: 'Adesso inverto i ruoli'."
    },
    {
        id: "storia_12",
        label: "12. Il Nickname Maledetto",
        emoji: "🏷️",
        titolo: "🏷️ Il Nickname Maledetto",
        testo: "Sul server vigeva una regola ferrea ed insolita: 'Mai impostare come nickname la parola N3v3rM0r3'. Un nuovo utente, convinto che fosse la solita trovata goliardica degli admin per fare i misteriosi, cambiò il proprio soprannome proprio con quella parola per sfidare il regolamento.\n\nAll'istante, il suo client di Discord si bloccò su una schermata nera. Dalla cassa audio partì una chiamata privata automatica in entrata. L'audio era saturo di voci sovrapposte che recitavano i suoi dati anagrafici, mentre sullo schermo le lettere del suo nuovo nickname si ricomponevano formando la frase: 'Grazie per averci aperto il varco'."
    },
    {
        id: "storia_13",
        label: "13. L'Intelligenza del Terrore",
        emoji: "🧠",
        titolo: "🧠 L'Intelligenza del Terrore",
        testo: "Un appassionato di tecnologia stava testando un'intelligenza artificiale avanzata programmata per scrivere racconti horror realistici. Gli diede come prompt: 'Scrivi una storia spaventosa ambientata in questo preciso momento'.\n\nL'IA rispose istantaneamente: 'C'era una volta un ragazzo seduto su una sedia nera, vestito con una felpa scura, che fissava lo schermo con la mano sinistra sulla tempia. Credeva di essere solo, ma non aveva notato che la porta dell'armadio alle sue spalle si stava aprendo lentamente di 5 centimetri...'. Il ragazzo raggelò: la descrizione corrispondeva nei minimi dettagli alla realtà."
    },
    {
        id: "storia_14",
        label: "14. La Stanza delle Banned Soul",
        emoji: "🔨",
        titolo: "🔨 La Stanza delle Banned Soul",
        testo: "Tutti pensano che quando un utente viene bannato da un server Discord, il suo account venga semplicemente disconnesso. Ma su *Elegance Sponsoring*, un ex-mod scoprì che il codice del bot reindirizzava gli utenti bannati in un canale nascosto e invisibile chiamato '#fossa-comune'.\n\nGli utenti bannati non potevano uscire né disconnettersi. I loro messaggi di aiuto continuavano ad accumularsi da anni in quel canale buio, scritti da account che continuavano a inviare testo anche quando i proprietari reali avevano spento il computer da tempo."
    },
    {
        id: "storia_15",
        label: "15. Il Tasto Sconosciuto",
        emoji: "⌨️",
        titolo: "⌨️ Il Tasto Sconosciuto",
        testo: "Pulendo una vecchia tastiera meccanica comprata ad un mercatino dell'usato, un ragazzo notò un tasto sconosciuto situato tra il tasto Ctrl e la barra spaziatrice, contrassegnato solo da un piccolo teschio inciso.\n\nSotto l'effetto della curiosità, premette il tasto misterioso. Improvvisamente, tutte le luci di casa sua si spensero contemporaneamente. I LED della tastiera iniziarono a pulsare di un rosso vivo, e dagli altoparlanti del computer uscì una voce roca: 'Tasto premuto. Il conto alla rovescia per l'evocazione è iniziato'."
    },
    {
        id: "storia_16",
        label: "16. La Chiamata di Gruppo Vuota",
        emoji: "👥",
        titolo: "👥 La Chiamata di Gruppo Vuota",
        testo: "Tardi nella notte di Halloween, tre amici rimasero in una chiamata di gruppo per chiacchierare. Verso le due di notte, due di loro salutarono e staccarono la spina, lasciando il terzo utente da solo nella stanza vocale.\n\nInvece di disconnettersi subito, il ragazzo rimase a fissare lo schermo per un minuto. Nonostante il microfono degli altri fosse disconnesso, dalle cuffie continuò a sentire distintamente un respiro affannoso ed il rumore di passi leggeri che si avvicinavano. Quando provò a premere il tasto rosso per uscire, Discord rispose: 'Impossibile disconnettersi. L'ospite della stanza non ti permette di andare via'."
    },
    {
        id: "storia_17",
        label: "17. Il File Corrotto",
        emoji: "📁",
        titolo: "📁 Il File Corrotto",
        testo: "Un utente scaricò un file archivio chiamato `Halloween_Pack.zip` inviato da uno sconosciuto nella chat del server. Tentando di estrarlo, l'antivirus bloccò subito l'operazione segnalando una minaccia critica inconsueta.\n\nIgnorando l'avviso, il ragazzo disattivò la protezione e aprì il file. Il desktop venne sommerso da centinaia di finestre di testo che si aprivano a catena. Ognuna conteneva una traccia audio registrata pochi secondi prima all'interno della stanza dell'utente: i suoi sospiri, le sue battute sulla tastiera e il battito accelerato del suo cuore."
    },
    {
        id: "storia_18",
        label: "18. L'Ombra nella Schermata",
        emoji: "🌑",
        titolo: "🌑 L'Ombra nella Schermata",
        testo: "Durante una sessione di condivisione schermo con gli amici per mostrare un nuovo videogioco, un utente notò che i suoi compagni di squadra avevano smesso di parlare ed erano rimasti in silenzio assoluto.\n\n'Ragazzi, ci siete?' chiese. Uno di loro rispose con voce tremante: 'Fratello, chi è quella figura altissima e nera che sta in piedi esattamente dietro la tua sedia? La vediamo benissimo dal tuo streaming!'. Il ragazzo guardò il monitor principale: sul suo schermo era tutto normale, ma nella finestra dello stream condiviso con gli altri, l'ombra lo stava afferrando per il collo."
    },
    {
        id: "storia_19",
        label: "19. Il Ruolo Maledetto",
        emoji: "🔮",
        titolo: "🔮 Il Ruolo Maledetto",
        testo: "Durante l'evento di Halloween, un utente riuscì ad aggiudicarsi un ruolo segreto dal nome 'Anima Tormentata'. Inizialmente era felice per il colore unico del nome nella lista utenti, ma presto le cose presero una piega inquietante.\n\nOgni volta che provava a digitare un messaggio in qualsiasi canale, le sue parole venivano automaticamente modificate dal bot in frasi d'aiuto disperate. Tenta di abbandonare il server, ma la pagina si ricaricava continuamente mantenendolo all'interno. Sullo profilo apparve uno stato personalizzato mai scritto da lui: 'Socio a vita dell'Oltretomba'."
    },
    {
        id: "storia_20",
        label: "20. La Fine del Server",
        emoji: "🎃",
        titolo: "🎃 La Fine del Server",
        testo: "Allo scoccare della mezzanotte del 31 Ottobre, l'intera grafica del server *Elegance Sponsoring* cambiò colore diventando nero pece ed arancione scuro. Le icone dei ruoli mutarono in piccoli teschi e le stanze testuali vennero rimpiazzate da un unico canale chiamatosi '#il-giudizio-finale'.\n\nTutti gli utenti connessi in quel momento ricevettero un messaggio in sovrimpressione che recitava: 'Il tempo è scaduto. Spegnete i monitor o ciò che abbiamo liberato stasera rimarrà con voi nelle vostre stanze per sempre'. Chi non spense subito il PC raccontò di aver sentito colpi fortissimi battere dal di dentro del proprio vetro del monitor..."
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("storia-horror")
        .setDescription("Scegli e sblocca una storia horror dal menu interattivo 🎃📖"),

    // Esecuzione del comando /storia-horror
    async execute(interaction) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("select_storia_horror")
            .setPlaceholder("🎃 Scegli quale incubo vuoi sbloccare oggi...");

        storie.forEach(storia => {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(storia.label)
                    .setValue(storia.id)
                    .setEmoji(storia.emoji)
            );
        });

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: "Scegli quale incubo vuoi sbloccare oggi (Mancano pochi giorni ad Halloween)... 🎃🕸️",
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    },

    // Handler chiamato dal registry quando l'utente seleziona una storia dal menu
    async selectMenuHandler(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        const storiaScelta = storie.find(s => s.id === interaction.values[0]);

        if (storiaScelta) {
            const storyEmbed = new EmbedBuilder()
                .setTitle(storiaScelta.titolo)
                .setDescription(storiaScelta.testo)
                .setColor("#1A1A1A")
                .setThumbnail("https://media.giphy.com/media/13GdXy1FkvHjoc/giphy.gif")
                .setFooter({ text: "Elegance Sponsoring • Storie di Halloween 🎃" })
                .setTimestamp();

            await interaction.reply({
                embeds: [storyEmbed],
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
