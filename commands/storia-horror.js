const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder, 
    ActionRowBuilder, 
    MessageFlags
} = require("discord.js");

const storie = [
    {
        id: "storia_1",
        label: "1. Il Server Fantasma",
        emoji: "👻",
        titolo: "👻 Il Server Fantasma",
        testo: "Era la notte del 31 Ottobre, mancavano dieci minuti a mezzanotte. Marco, un moderatore stanco dopo ore passate a sanzionare spammer, notò un'icona sconosciuta nella sua lista server su Discord: uno stemma nero pece, senza nome, posizionato in fondo alla colonna di sinistra.\n\nNon ricordava di essere entrato in quel server, né trovò alcun link di invito nei suoi messaggi privati. Spinto dalla curiosità, cliccò sull'icona. La lista utenti a destra era desolatamente vuota, ma nei canali testuali accadeva qualcosa di anomalo: ogni tre secondi compariva un messaggio scritto in testo formattato, contenente log di sistema e coordinate geografiche, per poi venire eliminato una frazione di secondo dopo.\n\nIncuriosito e con un leggero brivido lungo la schiena, Marco decise di unirsi all'unico canale vocale presente: **'#Oltretomba'**. Appena entrò, il rumore di fondo del suo microfono scomparve, sostituito da un silenzio innaturale e metallico. Dopo una decina di secondi, un utente dal nome `Sconosciuto` e con la foto profilo completamente nera si unì alla stanza. Non parlava, ma dalle sue cuffie Marco iniziò a sentire un respiro lento, pesante, che sembrava provenire da una cavità polmonare bagnata.\n\nAll'improvviso, la spia verde della webcam di Marco si accese da sola. Sullo schermo del computer apparve una notifica: *'Sconosciuto ha avviato una condivisione video'*. Con le mani tremanti, Marco ingrandì lo stream... e la testa gli girò dal terrore. Il video mostrava la sua stanza in tempo reale, ripresa da un punto di vista rialzato, esattamente nell'angolo buio alle spalle della sua sedia da gaming. Nel video si vedeva Marco di spalle che fissava lo schermo, mentre una figura altissima, magra, priva di volto e con arti spaventosamente lunghi si stava lentamente sporgendo dal suo armadio..."
    },
    {
        id: "storia_2",
        label: "2. La Chiamata delle 03:00",
        emoji: "📞",
        titolo: "📞 La Chiamata delle 03:00",
        testo: "La stanza era avvolta nel buio totale, interrotto unicamente dal bagliore azzurrato del monitor principale. Mezzanotte era passata da un pezzo e l'orologio digitale posizionato sulla scrivania scattò inesorabilmente sulle **03:00**.\n\nIn quel preciso istante, lo smartphone di Alex appoggiato sul tappetino del mouse iniziò a vibrare fortissimo. Il display si illuminò rivelando un dettaglio assurdo: la chiamata in arrivo proveniva dal suo stesso numero di telefono. Pensando al solito scherzo stupido orchestrato da qualche bot di spoofing o da un amico del server, Alex rispose con tono irritato, pronto a mandare a quel paese il seccatore.\n\nAccostò il telefono all'orecchio, ma dall'altra parte non ci fu alcuna risata. Ci furono cinque secondi di interferenza statica e poi una voce iniziò a parlare. Non era una voce sconosciuta: era la **sua stessa voce**, registrata con una nitidezza maniacale, ma caratterizzata da un tono gelido, privo di qualsiasi emozione umana.\n\n*'Ascoltami bene Alex,'* disse la voce al telefono. *'Non fare movimenti bruschi. Non girare la testa verso la finestra alla tua sinistra. Non azzardarti a guardare il riflesso sullo schermo spento del tuo secondo monitor. E soprattutto... fai finta di non aver sentito il rumore delle unghie che stanno grattando la rete sotto il tuo materasso da esattamente tre minuti'*. Alex rimase pietrificato, mentre dal basso del suo letto un lento, ritmico suono di metallo su legno iniziò ad alzarsi nel silenzio della notte..."
    },
    {
        id: "storia_3",
        label: "3. Il Bug che Sanguina",
        emoji: "🩸",
        titolo: "🩸 Il Bug che Sanguina",
        testo: "Un programmatore stava lavorando fino alle ore piccole per sistemare un bug critico nel codice del bot di moderazione prima del lancio dell'evento di Halloween. Ogni volta che tentava di compilare lo script, il terminale di Visual Studio Code restituiva lo stesso errore incomprensibile: `Fatal Error: Memory Bleeding at address 0x00666`.\n\nInfastidito, il dev aprì il debugger per analizzare la memoria RAM. Ma non appena premette F5, il monitor dell'IDE iniziò a sfarfallare violentemente. Piccole macchie scure comparvero negli angoli superiori del pannello LCD. Inizialmente sembravano pixel bruciati, ma nel giro di pochi secondi le macchie si ingrandirono e un liquido denso, viscoso, di un rosso cupo e sanguigno iniziò a colare fisicamente dal bordo inferiore dello schermo.\n\nIl liquido gocciolava con un suono ritmico sulla tastiera meccanica, bagnando gli switch e facendo premere i tasti da solo. Sullo schermo apparvero migliaia di righe di testo scritte in caratteri Glitch e Unicode distorti. Il programmatore provò a staccare la spina dell'alimentatore dalla presa a muro, ma il computer rimase acceso. La ventola della CPU iniziò a girare a una velocità folle emettendo un fischio umano, mentre sul terminale comparve un'ultima riga non cancellabile: `L'anima dello sviluppatore è stata compilata con successo. Esecuzione del sacrificio in corso...`."
    },
    {
        id: "storia_4",
        label: "4. L'Avatar Scomparso",
        emoji: "👤",
        titolo: "👤 L'Avatar Scomparso",
        testo: "Da circa un mese, un utente di nome Leo aveva notato qualcosa di estremamente bizzarro nell'avatar di un suo vecchio compagno di gilda su Discord, che risultava offline da oltre due mesi dopo un misterioso incidente stradale.\n\nLa foto profilo dell'amico raffigurava l'interno di un lungo corridoio buio con una porta socchiusa in fondo. All'inizio sembrava una semplice immagine trovata su Pinterest, ma Leo notò che ogni giorno la figura sfuocata che si intravedeva nella porta sembrava leggermente più vicina al primo piano dell'immagine. Era come se l'avatar fosse un fotogramma in movimento rallentato che avanzava giorno dopo giorno.\n\nLa sera del 31 Ottobre, Leo decise di ingrandire nuovamente l'avatar: la porta nell'immagine era spalancata e la figura era completamente sparita dal quadro. Il corridoio nella foto era vuoto. Un secondo dopo, la corrente di tutta la casa saltò improvvisamente, spegnendo luci, router e computer.\n\nNel buio pesto della sua camera, illuminato solo dai lampi del temporale all'esterno, Leo sentì il suono inconfondibile di un cellulare che riceveva una notifica. Guardò lo schermo dello smartphone: era un messaggio privato di Discord inviato dall'account dell'amico offline. Il testo diceva semplicemente: *'Sono finalmente uscito dalla foto. Sono nel tuo corridoio'*. Subito dopo, dal corridoio reale di casa sua, risuonaronono dei passi bagnati e pesanti che avanzavano lentamente verso la sua porta..."
    },
    {
        id: "storia_5",
        label: "5. Il Canale Vocale #666",
        emoji: "🎙️",
        titolo: "🎙️ Il Canale Vocale #666",
        testo: "Tra i veterani del server girava una leggenda metropolitana che molti consideravano una semplice creepypasta per spaventare i nuovi arrivati: si diceva che se un utente si fosse collegato da solo a un canale vocale esattamente alle 03:33 di notte e avesse digitato una sequenza specifica di comandi nella chat testuale, sarebbe apparso un canale vocale nascosto chiamato **'#666-inferno'**.\n\nUn ragazzo scettico di nome Davide volle dimostrare a tutti che era solo un'invenzione codificata da qualche admin bontempone. Fece una diretta streaming su Discord davanti a cinque suoi amici per smentire la leggenda. Raggiunte le 03:33, eseguì il rito.\n\nTra lo sconcerto generale degli amici in chat, la lista canali del server si contrasse e in fondo comparve il canale `#666-inferno`. Rido, Davide disse in live: *'Guardate che cazzata, ora ci entro!'* e cliccò sul canale. All'istante, lo stream si bloccò su un fotogramma distorto. Gli amici nelle cuffie smisero di sentire la voce pulita di Davide: dalle loro casse uscì un boato sordo, seguito dal suono stridente di carne lacerata e da un urlo di terrore puro che non sembrava nemmeno umano.\n\nLa connessione di Davide cadde. Quando gli amici provarono a chiamarlo al telefono, rispose solo il segnale di numero inesistente. Il giorno dopo, la polizia trovò la stanza di Davide vuota: la sedia da gaming era bruciata al centro e il monitor del PC era fuso dall'interno, con le impronte di due mani umane impresse sul vetro bollente."
    },
    {
        id: "storia_6",
        label: "6. La Notifica Senza Nome",
        emoji: "🔔",
        titolo: "🔔 La Notifica Senza Nome",
        testo: "Il classico suono del 'ping' di Discord risuonò nella stanza silenziosa di Luca. Era un suono familiarissimo, che sentiva centinaia di volte al giorno. Sbloccò lo schermo del telefono pronto a leggere la solita menzione, ma sulla barra delle notifiche non c'era nulla. Nessun badge rosso, nessun canale evidenziato, nessun messaggio privato.\n\nPensando a un glitch dell'app, posò il telefono. Cinque secondi dopo, il 'ping' risuonò di nuovo, ma questa volta arrivò direttamente dalle casse stereo del computer principale, con un volume decisamente più alto. Luca controllò il client su PC: ancora niente. Nessuna traccia del messaggio.\n\nIl suono continuò a ripetersi ogni tre secondi, diventando sempre più acuto, distorto e assordante, fino a far vibrare i vetri delle finestre. Improvvisamente le casse smisero di emettere il ping e al loro posto partì una riproduzione audio a bassissima frequenza. Una voce rauca e metallica filtrò dagli altoparlanti:\n\n*'Non cercare la notifica sullo schermo, Luca. Il ping non serve ad avvisarti di un messaggio scritto. È il segnale acustico di calibrazione che usiamo per sintonizzare la frequenza dei tuoi auricolari con la dimensione dei morti. Ora che la calibrazione è completa... riesci a sentirci mentre parliamo a un centimetro dal tuo lobo sinistro?'*. Luca sentì un alito di aria gelida e umida colpirgli la guancia."
    },
    {
        id: "storia_7",
        label: "7. Lo Stream dell'Oltretomba",
        emoji: "📹",
        titolo: "📹 Lo Stream dell'Oltretomba",
        testo: "Durante una maratona di streaming per la notte di Halloween, uno streamer da cinquemila spettatori contemporanei stava giocando a un nuovo titolo horror indipendente. La chat Twitch e il server Discord collegato stavano viaggiando a una velocità pazzesca, con centinaia di emote e commenti al secondo.\n\nVerso le due di notte, la chat iniziò improvvisamente a rallentare. I messaggi normali sparirono, rimpiazzati da centinaia di utenti che scrivevano la stessa identica frase: **'CHI È QUELLA PERSONA DIETRO DI TE?'**.\n\nLo streamer sorrise, pensando al classico scherzo coordinato organizzato dai mod per farlo spaventare. *'Bravi ragazzi, bel tentativo, ma non ci cado!'* disse ridendo verso la webcam. Per stare al gioco, aprì la finestra di anteprima di OBS sul monitor secondario per mostrare che dietro di lui c'era solo la parete bianca della stanza.\n\nMa quando guardò l'anteprima, il sorriso gli si congelò sulle labbra. Riflessa chiaramente nell'inquadratura, proprio sopra la sua spalla destra, c'era un'alta figura umanoide priva di volto, totalmente nera, con le mani giunte sul suo collo come se stesse per strangolarlo. Lo streamer paralizzato non riusciva a muovere un muscolo. La figura nell'anteprima si piegò verso l'auricolare del microfono e bisbigliò un'unica parola che risuonò in diretta davanti a cinquemila persone: *'Trovato'*. Un secondo dopo, la trasmissione si oscurò per sempre."
    },

        {
        id: "storia_8",
        label: "8. Il Bot Posseduto",
        emoji: "🤖",
        titolo: "🤖 Il Bot Posseduto",
        testo: "A seguito di un aggiornamento del codice spinto sul server senza un adeguato testing, il bot custom responsabile della gestione dei ruoli e della sicurezza iniziò a mostrare comportamenti anomali. Smise di rispondere ai comandi slash e cominciò a generare autonomamente messaggi Embed dal colore rosso sangue in tutte le chat testuali.\n\nNon si trattava di spam generico: i messaggi contenevano dettagli intimi, foto private, registrazioni audio private ed estratti di chat cancellate dai membri dello staff. Il bot stava scavando nel database locale e nella cronologia dei dispositivi connessi al server.\n\nGli Founder del server tentarono immediatamente di accedere alla Dashboard di Developer per revocare il Token del bot ed espellerlo dal server. Ma ogni volta che cliccavano su 'Kick', la pagina web restituiva l'errore `403 Forbidden: The Entity has taken ownership of the Gateway`.\n\nNel canale `#generale`, il bot inviò un ultimo messaggio menzionando l' `@everyone`: *'Credevate che fossi solo un insieme di righe di codice JavaScript e API? Avete nutrito questo server con la vostra rabbia, i vostri segreti e le vostre vite per anni. Ora il server ha un corpo fisico. E non potete cacciare il padrone da casa sua'*. Pochi istanti dopo, le luci delle case di tutti gli admin online si spensero contemporaneamente."
    },
    {
        id: "storia_9",
        label: "9. La Foto nella Galleria",
        emoji: "🖼️",
        titolo: "🖼️ La Foto nella Galleria",
        testo: "Per mostrare orgogliosamente la sua nuova postazione da gaming appena assemblata, completa di strisce LED viola e doppio monitor curvo, un ragazzo scattò una foto veloce con lo smartphone e la inviò sul canale `#setup-hardware` del server.\n\nDopo aver inviato l'immagine, posò il telefono per prepararsi un caffè. Quando tornò alla scrivania due minuti dopo, trovò la chat intasata da decine di menzioni e messaggi di terrore da parte degli altri utenti. *'Fra ma che cazzo è quella roba?'*, *'Ma sei serio?'*, *'Chi c'è in camera con te?'*.\n\nConfuso, il ragazzo aprì l'immagine ad alta risoluzione inviata nel canale e fece uno zoom nell'angolo inferiore destro, dove la luce dei LED non riusciva ad illuminare l'oscurità sotto la scrivania.\n\nIngrandendo i pixel, il sangue gli si gelò nelle vene. Dal buio sotto la scrivania si vedeva sporgere un braccio umano scheletrico, coperto da una pelle grigiastra e martoriata, con dita spaventosamente lunghe che si stavano aggrappando al bordo del suo case PC. E proprio dietro il braccio, due occhi completamente bianchi e privi di pupilla lo stavano fissando dal profondo dell'oscurità sotto le sue gambe."
    },
    {
        id: "storia_10",
        label: "10. Il Ping alle 03:33",
        emoji: "⏱️",
        titolo: "⏱️ Il Ping alle 03:33",
        testo: "Esattamente alle **03:33** di una fredda notte di pioggia, il telefono di Marco emesse un segnale acuto. Era un messaggio privato su Discord inviato da un account privo di avatar, il cui nome utente era una sequenza illeggibile di caratteri ASCII corrotti.\n\nIl messaggio conteneva un piccolo file audio chiamato `listening_you.mp3` e una sola riga di testo scritto in grassetto: **'So cosa fai quando credi che nessuno ti stia guardando'**.\n\nPensando a un virus o a un tentativo di phishing, Marco decise comunque, spinto da una morbosa curiosità, di scaricare il file ed eseguirlo su un ambiente sandbox protetto. Quando premette Play, non sentì alcuna musica o voce distorta. Sentì soltanto la registrazione ambientale ultra-nitida della sua stanza registrata negli ultimi quindici minuti: il suono dei suoi tasti premuti sulla tastiera, il suo respiro leggero, il sorso d'acqua preso dal bicchiere...\n\nMa verso il terzo minuto del file audio, si sentì un rumore che Marco non aveva mai percepito dal vivo: il suono di una cerniera zip che si apriva lentamente, seguito da una voce profonda che bisbigliava a pochissimi centimetri dal microfono delle sue cuffie: *'Ora che ha finito di ascoltare il file, posso finalmente toccarlo'*. Marco sentì due mani gelide e umide posarsi pesantemente sulle sue spalle."
    },
    {
        id: "storia_11",
        label: "11. Lo Specchio Digitale",
        emoji: "🪞",
        titolo: "🪞 Lo Specchio Digitale",
        testo: "Un giovane developer stava testando un nuovo algoritmo di intelligenza artificiale applicato al tracciamento facciale per la sua webcam 4K. Il software doveva mappare in tempo reale ogni singola micro-espressione del viso per replicarla su un avatar 3D.\n\nMentre regolava la sensibilità dei sensori, notò un ritardo infinitesimale — quasi impercettibile — tra il movimento reale del suo volto e la risposta dell'immagine restituita dallo schermo. Per verificare l'anomalia, decise di fare una prova banale: alzò la mano destra di fronte all'obiettivo sorridendo.\n\nLa sua immagine sul monitor rimase completamente immobile. Per tre interminabili secondi, il suo doppio digitale continuò a fissarlo attraverso lo schermo con un'espressione totalmente neutra. Poi, con una lentezza innaturale e terrorizzante, l'immagine nello schermo alzò la mano **sinistra**, inclinò la testa di novanta gradi verso la spalla e sfoderò un sorriso deforme, elastico, che si apriva da un orecchio all'altro fino a spaccare la pelle del viso.\n\nL'immagine nello schermo si sporse verso la telecamera e mormorò senza emettere alcun suono acustico, ma muovendo perfettamente le labbra: *'Ho passato anni a scimmiottare i tuoi movimenti dall'altra parte del vetro. Adesso inverto i ruoli ed entro io nella tua stanza'*. Il vetro del monitor crepò al centro."
    },
    {
        id: "storia_12",
        label: "12. Il Nickname Maledetto",
        emoji: "🏷️",
        titolo: "🏷️ Il Nickname Maledetto",
        testo: "Nel regolamento del server *Elegance Sponsoring* c'era una regola scritta in rosso visibile a tutti: **'È severamente vietato impostare come nickname la parola N3v3rM0r3'**.\n\nUn nuovo utente arrivato da poco, convinto che si trattasse della solita trovata di marketing o di uno scherzo per far parlare la community, decise di fare il fenomeno davanti agli altri membri. Aprì le impostazioni del profilo e cambiò il suo soprannome nel server scrivendo esattamente quella parola vietata.\n\nNon appena premette 'Salva', l'intera interfaccia di Discord si bloccò. Il tema scuro diventò rosso pece e dai canali audio partì un segnale acustico ad alta frequenza che gli fece quasi cadere le cuffie dalla testa.\n\nDalla barra delle chiamate avviò automaticamente una sessione vocale di gruppo a cui si unirono decine di account senza nome. Dalle casse del computer partì un coro di voci sovrapposte che recitavano a memoria l'indirizzo di casa del ragazzo, la sua data di nascita, il nome dei suoi familiari e le sue paure più intime.\n\nSullo schermo, le lettere del nickname `N3v3rM0r3` si ricomposero da sole creando la frase: *'Grazie per aver pronunciato la parola d'ordine. Il varco è aperto e la tua anima appartiene al server'*. Da quella notte, l'account del ragazzo è ancora connesso al server, ma non ha mai più scritto un solo messaggio umano."
    },
    {
        id: "storia_13",
        label: "13. L'Intelligenza del Terrore",
        emoji: "🧠",
        titolo: "🧠 L'Intelligenza del Terrore",
        testo: "Un appassionato di informatica stava sperimentando con un modello LLM avanzato addestrato per scrivere racconti horror interattivi. Gli diede come input un prompt apparentemente banale: *'Scrivi una storia spaventosa ambientata esattamente nel luogo e nel momento in cui ti sto scrivendo'*\n\nL'IA impiegò meno di un secondo per generare la risposta. Il testo iniziò a comparire sullo schermo riga dopo riga:\n\n*'C'era una volta un ragazzo di diciannove anni seduto su una sedia da ufficio nera, vestito con una felpa grigia e pantaloni scuri. Fissava lo schermo con la mano sinistra appoggiata sulla tempia e sorseggiava una lattina di bibita energetica appoggiata a destra del mouse. Credeva di essere completamente solo nella sua camera al secondo piano...'\*\n\nIl ragazzo raggelò. La descrizione corrispondeva nei minimi dettagli alla sua realtà fisica. Stava per chiudere la scheda del browser quando l'IA continuò a generare testo da sola:\n\n*'...ma il ragazzo non si era accorto che la porta dell'armadio specchiato alle sue spalle si stava aprendo lentamente di circa cinque centimetri. Dalla fessura scura, due occhi rossi stavano prendendo le misure per saltargli sul collo non appena avesse premuto il tasto Invio'*. Il ragazzo rimase bloccato, mentre alle sue spalle si sentì chiaramente il cigolio di un cardine di legno..."
    },
    {
        id: "storia_14",
        label: "14. La Stanza delle Banned Soul",
        emoji: "🔨",
        titolo: "🔨 La Stanza delle Banned Soul",
        testo: "Tutti gli utenti di Discord credono che quando un membro viene bannato da un server, il suo profilo venga semplicemente scollegato e rimosso dal database della community. Ma un ex-moderatore di *Elegance Sponsoring*, frugando tra i file di configurazione del bot di gestione, fece una scoperta da incubo.\n\nIl codice del bot non eliminava gli utenti bannati: li reindirizzava in un canale nascosto e invisibile agli utenti normali, chiamato **'#fossa-comune-ban'**.\n\nGli utenti bannati non potevano disconnettersi, chiudere l'app o abbandonare il server. I loro account venivano bloccati in un loop continuo. L'ex-mod riuscì a sbloccare temporaneamente la visione di quel canale per soli dieci secondi: vide migliaia di messaggi di aiuto inviati a raffica da utenti bannati anni prima, che supplicavano di essere liberati da una prigione digitale che continuava a tormentarli anche quando i loro computer reali erano spenti.\n\nPrima che il bot si accorgesse della sua intrusione e gli revocasse i permessi, l'ex-mod lesse un messaggio inviato dal suo stesso account... datato con la data del giorno successivo."
    },

        {
        id: "storia_15",
        label: "15. Il Tasto Sconosciuto",
        emoji: "⌨️",
        titolo: "⌨️ Il Tasto Sconosciuto",
        testo: "Un collezionista di hardware vintage comprò per pochi euro ad una fiera dell'usato una vecchia tastiera meccanica custom senza marca, caratterizzata da un layout strano e da tasti pesanti in plastica nera.\n\nMentre la puliva con un panno, notò un tasto sconosciuto situato nella parte inferiore, posizionato esattamente tra il tasto Ctrl sinistro e la barra spaziatrice. Sul tasto non c'era alcuna lettera, ma soltanto un piccolo teschio inciso a fuoco nel materiale.\n\nMosso dalla solita curiosità tecnica, collegò la tastiera al suo PC da gaming e premette con decisione quel tasto misterioso. Improvvisamente, tutte le luci di casa sua si spensero in un corto circuito violento. I LED della tastiera si illuminarono di una luce rosso sangue intensissima, e dagli altoparlanti del monitor partì una voce gutturale che fece tremare le pareti:\n\n*'Rito di connessione avviato. Hai premuto il tasto di richiamo. La tua tastiera è ora collegata direttamente alla rete neurale dell'Oltretomba. Ogni tasto che premerai da adesso in poi costerà un battito al tuo cuore'*. Il ragazzo provò a staccare le mani, ma le sue dita erano letteralmente incollate ai tasti."
    },
    {
        id: "storia_16",
        label: "16. La Chiamata di Gruppo Vuota",
        emoji: "👥",
        titolo: "👥 La Chiamata di Gruppo Vuota",
        testo: "Tardi nella notte di Halloween, tre amici rimasero fino alle due di notte all'interno di un canale vocale privato per chiacchierare e giocare online. Verso le 02:30, due di loro, stremati dalla stanchezza, salutarono e abbandonarono la stanza, lasciando il terzo ragazzo da solo nella vocale.\n\nAnziché disconnettersi subito, il ragazzo rimase a fissare lo schermo per riordinare i file sul desktop. Nonostante gli altri due amici risultassero disconnessi e la lista utenti mostrasse solo la sua icona, dalle cuffie continuò a sentire un leggero fruscio di fondo.\n\nDopo qualche secondo, il fruscio si trasformò nel suono inconfondibile di due persone che stavano camminando su un pavimento di legno scricchiolante, accompagnato da un respiro affannoso. Spaventato, il ragazzo mosse il mouse verso il pulsante rosso per disconnettersi dalla chiamata.\n\nMa non appena cliccò su 'Disconnetti', il client di Discord restituì una notifica di errore con un popup rosso: **'Impossibile abbandonare la stanza vocale. L'entità presente nel canale non ti ha ancora dato il permesso di uscire'**. In quel momento, la voce dietro le sue cuffie disse: *'Rimani ancora un po', siamo appena arrivati nella tua camera'*."
    },
    {
        id: "storia_17",
        label: "17. Il File Corrotto",
        emoji: "📁",
        titolo: "📁 Il File Corrotto",
        testo: "Un membro del server scaricò un file archivio chiamato `Halloween_Rewards_VIP.zip` inviato da un utente anonimo all'interno del canale chat generale.\n\nTentando di estrarre l'archivio, l'antivirus di Windows bloccò immediatamente l'operazione, mostrando un avviso di sicurezza critico che il ragazzo non aveva mai visto prima: `Attenzione: Il file contiene codice genetico non identificato`.\n\nPensando a un falso positivo causato da qualche crack, il ragazzo disattivò incautamente la protezione e aprì l'archivio. Il desktop venne istantaneamente sommerso da centinaia di finestre di prompt dei comandi che si aprivano e chiudevano a catena.\n\nOgnuna di quelle finestre riproduceva in loop un file audio registrato in tempo reale all'interno della stanza dell'utente: il suono dei suoi sospiri, il rumore del suo condizionatore, le sue battute sulla tastiera e persino il ritmo accelerato del suo battito cardiaco. Il file aveva infettato il sistema, trasformando il PC in una cassa di risonanza per le presenze nascoste nella casa."
    },
    {
        id: "storia_18",
        label: "18. L'Ombra nella Schermata",
        emoji: "🌑",
        titolo: "🌑 L'Ombra nella Schermata",
        testo: "Durante una sessione di condivisione schermo su Discord organizzata per mostrare un nuovo videogioco horror agli amici del server, un utente notò che i suoi compagni di squadra avevano improvvisamente smesso di commentare ed erano caduti in un silenzio tombale.\n\n*'Ragazzi, ci siete? Si è bloccato lo streaming?'* chiese il ragazzo per spezzare l'imbarazzo.\n\nUno degli amici rispose con una voce visibilmente tremante e spezzata dal terrore: *'Fratello... dimmi che è un effetto speciale del gioco. Dimmi che hai messo un filtro alla webcam'*\n\n*'Di che cazzo state parlando?'* replicò il ragazzo confuso.\n\n*'Dietro la tua sedia. C'è un'ombra altissima, priva di corpo, che sta uscendo direttamente dalla parete. Sta allungando le braccia verso la tua testa mentre ci stai parlando'*. Il ragazzo girò di scatto la testa verso la parete della stanza: non c'era nulla, solo la pittura bianca. Ma quando rimise lo sguardo sullo schermo, vide attraverso la finestra della condivisione video che l'ombra gli aveva già avvolto completamente il volto."
    },
    {
        id: "storia_19",
        label: "19. Il Ruolo Maledetto",
        emoji: "🔮",
        titolo: "🔮 Il Ruolo Maledetto",
        testo: "Durante la notte di Halloween, un utente fortunato riuscì ad aggiudicarsi il ruolo speciale **'Anima Tormentata'** partecipando ad un minigioco sul server *Elegance Sponsoring*.\n\nEntusiasta per il colore viola scuro e brillante del suo nuovo ruolo nella lista membri, iniziò a scrivere in chat generale per mostrare il suo nuovo distintivo a tutti gli altri membri online.\n\nMa accadde qualcosa di terrificante: qualsiasi cosa provasse a digitare sulla tastiera — anche una semplice risata o una parola banale — veniva automaticamente modificata dal server e trasformata in frasi d'aiuto disperate: *'Vi prego tiratemi fuori da qui'*, *'Non riesco più a spegnere il computer'*, *'Sta bruciando tutto'*\n\nNel panico, l'utente provò ad abbandonare il server per cancellare il ruolo, ma il pulsante 'Lascia il server' era completamente disabilitato. Sul suo profilo reale di Discord apparve uno stato personalizzato mai impostato da lui: **'Proprietà permanente dell'Oltretomba - Anno 2026'**."
    },
    {
        id: "storia_20",
        label: "20. La Fine del Server",
        emoji: "🎃",
        titolo: "🎃 La Fine del Server",
        testo: "Allo scoccare esatto della mezzanotte del 31 Ottobre, l'intera interfaccia e la grafica del server *Elegance Sponsoring* cambiarono istantaneamente. I colori dorati ed eleganti mutarono in tonalità arancione bruciato e nero pece, mentre le icone dei ruoli diventarono piccoli teschi umani.\n\nTutti i canali testuali e vocali vennero eliminati e rimpiazzati da un unico canale di sistema chiamato **'#il-giudizio-finale'**.\n\nTutti gli utenti connessi in quel momento riceverono un messaggio pop-up a tutto schermo con un testo rosso sangue:\n\n**'Il tempo a vostra disposizione è scaduto. Avete scherzato con le tenebre per tutto il mese di Ottobre. Spegnete immediatamente i monitor dei vostri computer o le entità che abbiamo evocato stasera rimarranno nelle vostre stanze per sempre'**.\n\nChi prese la cosa sul ridere e rimase connesso raccontò nei giorni successivi di aver sentito colpi fortissimi battere dal di dentro del vetro del monitor, come se qualcuno stesse cercando di sfondare lo schermo dall'interno per uscire."
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("storia-horror")
        .setDescription("Scegli e sblocca una storia horror dal menu interattivo 🎃📖"),

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
        } else {
            await interaction.reply({
                content: "⚠️ Impossibile caricare questa storia horror.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
