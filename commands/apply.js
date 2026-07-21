const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags,
    ChannelType
} = require("discord.js");

const STAFF_ROLE_ID = "1528576014446231683";

// Configurazione locale del sistema candidature
const applyConfig = {
    targetChannel: null, // ID Canale dove arrivano le candidature compilate
    enabled: true
};

// Domande del form di candidatura
const QUESTIONS = [
    "📌 **Domanda 1/4:** Quanti anni hai e quali sono i tuoi orari di disponibilità sul server?",
    "📌 **Domanda 2/4:** Hai già avuto esperienze pregresse come Moderatore/Staff su Discord?",
    "📌 **Domanda 3/4:** Perché dovremmo scegliere te rispetto ad altri candidati?",
    "📌 **Domanda 4/4:** Come ti comporteresti di fronte a un utente che provoca o infrange il regolamento?"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("apply")
        .setDescription("Gestisci o invia il pannello delle candidature Staff")
        .addSubcommand(sub =>
            sub.setName("panel")
               .setDescription("Gestisci lo stato e il canale di invio delle candidature (Solo Staff)"))
        .addSubcommand(sub =>
            sub.setName("send")
               .setDescription("Invia l'embed pubblico per le candidature nel canale corrente (Solo Staff)")),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire le candidature.",
                flags: MessageFlags.Ephemeral
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "panel") {
            const embed = new EmbedBuilder()
                .setTitle("⚙️ ELEGANCE SPONSORING ── CONFIGURAZIONE CANDIDATURE")
                .setDescription(
                    "Da questo pannello puoi attivare/disattivare il sistema e impostare il canale dove lo Staff riceverà le candidature inoltrate.\n\n" +
                    `📌 **Canale Ricezione Moduli:** ${applyConfig.targetChannel ? `<#${applyConfig.targetChannel}>` : "`Non impostato (Usa canale corrente)`"}\n` +
                    `• **Stato Candidature:** ${applyConfig.enabled ? "🟢 Aperte" : "🔴 Chiuse"}`
                )
                .setColor(0x00FF99)
                .setFooter({ text: "Elegance Sponsoring • Apply Control" })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("apply_toggle")
                    .setLabel(applyConfig.enabled ? "Chiudi Candidature" : "Apri Candidature")
                    .setStyle(applyConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("apply_set_channel")
                    .setLabel("📌 Imposta Canale Ricezione")
                    .setStyle(ButtonStyle.Primary)
            );

            return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
        }

        if (subcommand === "send") {
            const publicEmbed = new EmbedBuilder()
                .setTitle("📝 ELEGANCE SPONSORING ── CANDIDATURE STAFF")
                .setDescription(
                    "Vorresti fare parte dello staff ufficiale di **Elegance Sponsoring**?\n" +
                    "Stiamo cercando persone motivate, attive ed educate per ampliare il nostro team!\n\n" +
                    "────────────────────────────────────────\n\n" +
                    "✧ ʀᴇǫᴜɪsɪᴛɪ & Linee Guida\n" +
                    " • 📜 Conoscenza approfondita del regolamento del server.\n" +
                    " • 🤝 Rispetto, massima serietà e nessuna attitudine al trolling.\n" +
                    " • ⏱️ Buona disponibilità di tempo e presenza attiva nei canali.\n\n" +
                    "────────────────────────────────────────\n\n" +
                    "✧ ᴄᴏᴍᴇ Cᴀɴᴅɪᴅᴀʀsɪ\n" +
                    "1. Clicca sul pulsante **📝 Candidati Ora** qui sotto.\n" +
                    "2. Il bot ti invierà un messaggio privato (DM) per iniziare il modulo.\n" +
                    "3. Rispondi alle domande in modo chiaro e rispettoso.\n\n" +
                    "⚠️ *Nota: Risposte non serie o goliardiche porteranno al rifiuto e a possibili sanzioni.*"
                )
                .setColor(0x00FF99)
                .setFooter({ text: "Elegance Sponsoring • Staff Recruitment", iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("apply_start_button")
                    .setLabel("📝 Candidati Ora")
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.channel.send({ embeds: [publicEmbed], components: [button] });
            return interaction.reply({ content: "✅ Pannello candidature inviato con successo!", flags: MessageFlags.Ephemeral });
        }
    },

    // Gestore dei Bottoni di Configurazione e Avvio Candidatura
    async buttonHandler(interaction) {
        const { customId, channel, user, guild } = interaction;

        // --- BOTTONI DEL PANNELLO CONFIG ---
        if (customId === "apply_toggle" || customId === "apply_set_channel") {
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({ content: "❌ Permessi insufficienti.", flags: MessageFlags.Ephemeral });
            }

            if (customId === "apply_toggle") {
                applyConfig.enabled = !applyConfig.enabled;
            } else if (customId === "apply_set_channel") {
                applyConfig.targetChannel = channel.id;
            }

            const embed = new EmbedBuilder()
                .setTitle("⚙️ ELEGANCE SPONSORING ── CONFIGURAZIONE CANDIDATURE")
                .setDescription(
                    "Configurazione aggiornata con successo!\n\n" +
                    `📌 **Canale Ricezione Moduli:** <#${applyConfig.targetChannel || channel.id}>\n` +
                    `• **Stato Candidature:** ${applyConfig.enabled ? "🟢 Aperte" : "🔴 Chiuse"}`
                )
                .setColor(0x00FF99);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("apply_toggle")
                    .setLabel(applyConfig.enabled ? "Chiudi Candidature" : "Apri Candidature")
                    .setStyle(applyConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("apply_set_channel")
                    .setLabel("📌 Imposta Canale Ricezione")
                    .setStyle(ButtonStyle.Primary)
            );

            return interaction.update({ embeds: [embed], components: [row] });
        }

        // --- BOTTONE "CANDIDATI ORA" (AVVIO INTERVISTA IN DM) ---
        if (customId === "apply_start_button") {
            if (!applyConfig.enabled) {
                return interaction.reply({
                    content: "🔒 **Candidature Chiuse:** Al momento le candidature Staff sono temporaneamente sospese.",
                    flags: MessageFlags.Ephemeral
                });
            }

            // Prova ad aprire il DM
            try {
                const dm = await user.createDM();

                // Messaggio Iniziale di Avviso Anti-Trolling
                const warningEmbed = new EmbedBuilder()
                    .setTitle("🛡️ ELEGANCE SPONSORING ── CANDIDATURA UFFICIALE")
                    .setDescription(
                        "⚠️ **ATTENZIONE PRIMA DI INIZIARE:**\n\n" +
                        "Stai per avviare il processo di candidatura **Ufficiale** per entrare nello Staff di **Elegance Sponsoring**.\n\n" +
                        "• È richiesto un comportamento **massimamente educato, rispettoso e maturo**.\n" +
                        "• È **severamente vietato fare trolling**, scrivere risposte insensate o usare toni sfrontati.\n" +
                        "• Ogni risposta verrà registrata e valutata dagli Amministratori.\n\n" +
                        "Sei pronto/a? Rispondi direttamente in questa chat alla prima domanda!"
                    )
                    .setColor(0xFFAA00)
                    .setFooter({ text: "Elegance Sponsoring • Recruitment System" });

                await dm.send({ embeds: [warningEmbed] });
                await interaction.reply({ content: "📩 **Controlla i tuoi Messaggi Privati (DM)!** Ti abbiamo inviato le istruzioni per la candidatura.", flags: MessageFlags.Ephemeral });

                // Avvio flusso domande
                const answers = [];
                for (let i = 0; i < QUESTIONS.length; i++) {
                    await dm.send(QUESTIONS[i]);

                    // Attende risposta per 5 minuti a domanda
                    const filter = m => m.author.id === user.id;
                    const collected = await dm.channel.awaitMessages({ filter, max: 1, time: 300000, errors: ['time'] })
                        .catch(() => null);

                    if (!collected) {
                        return dm.send("⏱️ **Tempo Scaduto:** Hai impiegato troppo tempo per rispondere. Candidatura annullata.");
                    }

                    answers.push(collected.first().content);
                }

                // Invia conferma all'utente
                await dm.send("✅ **Candidatura Inviata con Successo!** Il nostro team di Amministrazione valuterà la tua richiesta al più presto. Buona fortuna!");

                // Invia la candidatura nel canale dello Staff impostato
                const targetChanId = applyConfig.targetChannel || guild.systemChannelId;
                const targetChannel = guild.channels.cache.get(targetChanId);

                if (targetChannel) {
                    const resultEmbed = new EmbedBuilder()
                        .setTitle(`📩 NUOVA CANDIDATURA STAFF ── ${user.username}`)
                        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                        .setColor(0x00FF99)
                        .setDescription(`**Candidato:** ${user} (\`${user.tag}\`)\n**ID Utente:** \`${user.id}\``)
                        .setFooter({ text: "Elegance Sponsoring • Modulo Inviato" })
                        .setTimestamp();

                    QUESTIONS.forEach((q, idx) => {
                        resultEmbed.addFields({
                            name: q.replace(/[\*\_]/g, ""),
                            value: answers[idx] || "*Nessuna risposta*"
                        });
                    });

                    await targetChannel.send({ embeds: [resultEmbed] });
                }

            } catch (err) {
                console.error("Errore nell'invio DM Candidatura:", err);
                return interaction.reply({
                    content: "❌ **Impossibile inviarti un DM!** Assicurati di avere i messaggi privati aperti per i membri del server.",
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};
      
