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
        testo: "Era la notte del 31 Ottobre, mancavano dieci minuti a mezzanotte. Marco, un moderatore stanco, notò un'icona sconosciuta nella sua lista server: uno stemma nero pece, senza nome...\n\nIncuriosito, si unì all'unico canale vocale '#Oltretomba'. Appena entrò, la sua webcam si accese da sola. Sullo schermo apparve una condivisione video che mostrava la sua stanza ripresa da dietro la sua sedia, mentre una figura magra e priva di volto usciva dal suo armadio..."
    },
    {
        id: "storia_2",
        label: "2. La Chiamata delle 03:00",
        emoji: "📞",
        titolo: "📞 La Chiamata delle 03:00",
        testo: "Alle 03:00 in punto, il telefono di Alex vibro fortissimo. La chiamata proveniva dal suo stesso numero. Rispose e sentì la sua stessa voce dire: 'Non girarti verso la finestra e fai finta di non sentire le unghie che grattano sotto il tuo letto'..."
    },
    {
        id: "storia_3",
        label: "3. Il Bug che Sanguina",
        emoji: "🩸",
        titolo: "🩸 Il Bug che Sanguina",
        testo: "Un dev stava risolvendo un bug prima di Halloween. Ogni volta che compilava, un liquido rosso e denso colava fisicamente dal monitor sulla tastiera, facendo digitare frasi incomprensibili da sole..."
    },
    {
        id: "storia_4",
        label: "4. L'Avatar Scomparso",
        emoji: "👤",
        titolo: "👤 L'Avatar Scomparso",
        testo: "L'avatar di un amico offline da mesi mostrava una figura che ogni giorno si avvicinava al primo piano. La sera del 31 la figura sparì dalla foto e un messaggio recitò: 'Sono uscito dalla foto, sono nel tuo corridoio'..."
    },
    {
        id: "storia_5",
        label: "5. Il Canale Vocale #666",
        emoji: "🎙️",
        titolo: "🎙️ Il Canale Vocale #666",
        testo: "Entrando nel canale segreto #666 alle 03:33, la trasmissione dello streamer si bloccò con urla disperate. Il giorno dopo trovarono la sua camera vuota e il monitor fuso con le impronte di due mani..."
    },
    {
        id: "storia_6",
        label: "6. La Notifica Senza Nome",
        emoji: "🔔",
        titolo: "🔔 La Notifica Senza Nome",
        testo: "Un ping continuo e assordante risuonò dalle casse. Una voce filtrò dagli altoparlanti: 'Il ping serve a sintonizzare gli auricolari con la dimensione dei morti. Riesci a sentirci mentre parliamo al tuo orecchio?'..."
    },
    {
        id: "storia_7",
        label: "7. Lo Stream dell'Oltretomba",
        emoji: "📹",
        titolo: "📹 Lo Stream dell'Oltretomba",
        testo: "In diretta Twitch, tutta la chat iniziò a scrivere: 'CHI È QUELLA PERSONA DIETRO DI TE?'. Riflessa negli occhiali dello streamer c'era una figura nera che gli avvolgeva il collo..."
    },
    {
        id: "storia_8",
        label: "8. Il Bot Posseduto",
        emoji: "🤖",
        titolo: "🤖 Il Bot Posseduto",
        testo: "Il bot del server iniziò a pubblicare i segreti e gli indirizzi reali di tutti i membri online. Impossibile da espellere, inviò un ultimo messaggio: 'Avete nutrito questo server per anni, ora ha un corpo'..."
    },
    {
        id: "storia_9",
        label: "9. La Foto nella Galleria",
        emoji: "🖼️",
        titolo: "🖼️ La Foto nella Galleria",
        testo: "Inviando la foto del suo nuovo setup da gaming, la chat notò sotto la scrivania una mano scheletrica e due occhi bianchi privi di pupilla che fissavano l'obiettivo dal buio..."
    },
    {
        id: "storia_10",
        label: "10. Il Ping alle 03:33",
        emoji: "⏱️",
        titolo: "⏱️ Il Ping alle 03:33",
        testo: "Un file audio MP3 arrivò alle 03:33. Conteneva la registrazione ultra-nitida dei respiri del ragazzo presi negli ultimi 15 minuti e la voce: 'Ora che hai finito di ascoltare, posso toccarti'..."
    },
    {
        id: "storia_11",
        label: "11. Lo Specchio Digitale",
        emoji: "🪞",
        titolo: "🪞 Lo Specchio Digitale",
        testo: "Testando una fotocamera 4K, il riflesso digitale del dev smise di seguire i movimenti. L'immagine nello schermo sorrise spaventosamente e disse: 'Adesso entro io nella tua stanza'..."
    },
    {
        id: "storia_12",
        label: "12. Il Nickname Maledetto",
        emoji: "🏷️",
        titolo: "🏷️ Il Nickname Maledetto",
        testo: "Cambiare il nickname nella parola vietata N3v3rM0r3 fece bloccare il client. Una chiamata automatica recitò i dati anagrafici e la paura più grande dell'utente..."
    },
    {
        id: "storia_13",
        label: "13. L'Intelligenza del Terrore",
        emoji: "🧠",
        titolo: "🧠 L'Intelligenza del Terrore",
        testo: "Chiedendo all'IA una storia ambientata nel presente, l'IA descrisse esattamente i vestiti, la posizione e la stanza del ragazzo, concludendo: 'L'armadio dietro di te si sta aprendo'..."
    },
    {
        id: "storia_14",
        label: "14. La Stanza delle Banned Soul",
        emoji: "🔨",
        titolo: "🔨 La Stanza delle Banned Soul",
        testo: "Gli utenti bannati venivano rinchiusi in un canale invisibile chiamato #fossa-comune-ban dove i loro account continuavano a mandare messaggi d'aiuto anche a PC spento..."
    },
    {
        id: "storia_15",
        label: "15. Il Tasto Sconosciuto",
        emoji: "⌨️",
        titolo: "⌨️ Il Tasto Sconosciuto",
        testo: "Premere il tasto teschio su una vecchia tastiera staccò la corrente di casa e una voce disse: 'Ogni tasto che premerai da adesso in poi costerà un battito al tuo cuore'..."
    },
    {
        id: "storia_16",
        label: "16. La Chiamata di Gruppo Vuota",
        emoji: "👥",
        titolo: "👥 La Chiamata di Gruppo Vuota",
        testo: "Rimasto solo in stanza vocale, il pulsante 'Disconnetti' smise di funzionare. Nelle cuffie si sentirono passi avvicinarsi e la frase: 'Rimani, siamo appena arrivati nella tua camera'..."
    },
    {
        id: "storia_17",
        label: "17. Il File Corrotto",
        emoji: "📁",
        titolo: "📁 Il File Corrotto",
        testo: "Aprire un archivio ZIP infetto fece aprire centinaia di finestre di prompt dei comandi che riproducevano l'audio ambientale ed il battito cardiaco registrati dal microfono..."
    },
    {
        id: "storia_18",
        label: "18. L'Ombra nella Schermata",
        emoji: "🌑",
        titolo: "🌑 L'Ombra nella Schermata",
        testo: "In condivisione schermo gli amici videro un'ombra altissima uscire dal muro dietro la sedia del ragazzo ed avvolgergli completamente la testa mentre lui non sentiva nulla..."
    },
    {
        id: "storia_19",
        label: "19. Il Ruolo Maledetto",
        emoji: "🔮",
        titolo: "🔮 Il Ruolo Maledetto",
        testo: "Ottenere il ruolo 'Anima Tormentata' modificava ogni messaggio scritto dall'utente in richieste d'aiuto disperate, impedendo al giocatore di uscire dal server..."
    },
    {
        id: "storia_20",
        label: "20. La Fine del Server",
        emoji: "🎃",
        titolo: "🎃 La Fine del Server",
        testo: "A mezzanotte del 31 Ottobre apparve il messaggio: 'Spegnete i monitor o le entità evocate rimarranno con voi'. Chi rimase connesso sentì colpi fortissimi battere dal di dentro dello schermo..."
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

    // HANDLER FIXATO AL 100%: usa deferUpdate() + followUp()
    async selectMenuHandler(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        try {
            // 1. Sblocca istantaneamente l'interfaccia di Discord (STOP al caricamento!)
            await interaction.deferUpdate().catch(() => {});

            const storiaScelta = storie.find(s => s.id === interaction.values[0]);

            if (storiaScelta) {
                const storyEmbed = new EmbedBuilder()
                    .setTitle(storiaScelta.titolo)
                    .setDescription(storiaScelta.testo)
                    .setColor("#1A1A1A")
                    .setThumbnail("https://media.giphy.com/media/13GdXy1FkvHjoc/giphy.gif")
                    .setFooter({ text: "Elegance Sponsoring • Storie di Halloween 🎃" })
                    .setTimestamp();

                // 2. Invia la storia come messaggio effimero riservato
                await interaction.followUp({
                    embeds: [storyEmbed],
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error("[STORIA-HORROR] Errore nell'handler:", error);
        }
    }
};
