const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');

const DATA_PATH = './ticketsData.json';
const STAFF_ROLE_ID = "1528576030783176835";
const CATEGORY_ID = "1528582447443345560";
const ALLOWED_CHANNEL_ID = "1528576161959907348";
const LOG_CHANNEL_ID = "1528576197741772902";

// 🎯 DOMANDE SPECIFICHE PER OGNI CATEGORIA
const CATEGORY_QUESTIONS = {
    servizi: [
        "1️⃣ Quale servizio o pacchetto VIP necessita di assistenza?",
        "2️⃣ Descrivi nei dettagli la richiesta o il problema riscontrato:",
        "3️⃣ Hai già effettuato un pagamento o possiedi una ricevuta/ID transazione?"
    ],
    partner: [
        "1️⃣ Per quale brand, community o progetto stai richiedendo una collaborazione?",
        "2️⃣ Quali sono i tuoi numeri attuali e i link ai tuoi canali/piattaforme principali?",
        "3️⃣ Qual è la tua proposta di partnership e cosa metti a disposizione?"
    ],
    bug: [
        "1️⃣ Quale errore tecnico o bug si è verificato e in quale piattaforma/sezione?",
        "2️⃣ Quali sono i passaggi esatti per riprodurre il problema?",
        "3️⃣ Puoi fornire uno screenshot, un video o il testo esatto dell'errore?"
    ],
    report: [
        "1️⃣ Chi intendi segnalare (Tag o ID Utente) e dove si è verificato l'evento?",
        "2️⃣ Quale norma del regolamento è stata violata e cosa è accaduto nel dettaglio?",
        "3️⃣ Possiedi prove trasparenti (screenshot non modificati o registrazioni video)?"
    ]
};

const getData = () => {
    try {
        if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '{}');
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '{}');
    } catch {
        return {};
    }
};
const saveData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));

async function sendSystemLog(guild, embed, files = []) {
    try {
        const logChannel = await guild.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
        if (logChannel) {
            await logChannel.send({ embeds: [embed], files: files });
        }
    } catch (err) {
        console.error("[ERROR_LOG_CHANNEL] Impossibile inviare il log nel canale dedicato:", err);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Invia il pannello principale per la gestione dei ticket di assistenza'),

    async execute(interaction) {
        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            console.warn(`[SECURITY] Tentativo di esecuzione non autorizzata del comando /ticket da parte di ${interaction.user.tag} (${interaction.user.id}) nel canale ${interaction.channelId}`);
            return interaction.reply({ content: "❌ **Accesso Negato:** Questo comando non può essere eseguito in questo canale.", flags: MessageFlags.Ephemeral });
        }

        const embed = new EmbedBuilder()
            .setTitle("🛡️ ELEGANCE SPONSORING ── CENTER ASSISTANCE")
            .setDescription(
                "👑 **Benvenuto nel Centro Assistenza Ufficiale di Elegance Sponsoring!**\n\n" +
                "Il nostro team di supporto è a tua completa disposizione per fornirti un'assistenza rapida, professionale e su misura. " +
                "Per permetterci di gestire al meglio la tua richiesta, ti invitiamo a selezionare dal menu sottostante la categoria che meglio descrive la tua esigenza.\n\n" +
                "⚙️ **Informativa & Linee Guida dell'Assistenza:**\n" +
                "• ⏱️ **Tempi di Risposta:** L'assistenza viene fornita in base alla disponibilità del nostro Staff. Ti preghiamo di portare pazienza.\n" +
                "• 🎯 **Domande Automatizzate:** Una volta aperto il ticket, ti verrà richiesta una rapida compilazione di 3 domande per inquadrare subito il problema.\n" +
                "• ⚠️ **Uso Responsabile:** Aprire ticket inutili, goliardici o privi di senso porterà a sanzioni disciplinari o al blacklist dal supporto."
            )
            .addFields(
                { name: "💎 ── Servizi & Pass VIP", value: "📊 *Richiedi informazioni sui nostri servizi esclusivi, attivazione pacchetti VIP o assistenza sui pagamenti effettuati.*", inline: false },
                { name: "🤝 ── Partnership & Sponsoring", value: "📈 *Invia le tue proposte commerciali, accordi di collaborazione o richieste di sponsorship per la tua community/brand.*", inline: false },
                { name: "🐛 ── Bug & Problemi Tecnici", value: "🔧 *Segnala errori di sistema, malfunzionamenti dei bot o problematiche tecniche riscontrate nei nostri canali.*", inline: false },
                { name: "🚨 ── Segnalazioni & Report Staff", value: "🛡️ *Invia segnalazioni riservate riguardanti utenti scorretti, tentativi di truffa o violazioni del regolamento.*", inline: false }
            )
            .setColor(0x2f3136)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: "Elegance Sponsoring • Sistema di Supporto Automatizzato v2.0", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('📂 Seleziona il dipartimento di supporto...')
                .addOptions([
                    new StringSelectMenuOptionBuilder().setLabel('Servizi & VIP').setValue('servizi').setDescription('Richiedi supporto su servizi e abbonamenti VIP').setEmoji('💎'),
                    new StringSelectMenuOptionBuilder().setLabel('Partnership & Sponsor').setValue('partner').setDescription('Proponi collaborazioni o sponsorship').setEmoji('🤝'),
                    new StringSelectMenuOptionBuilder().setLabel('Bug & Errori').setValue('bug').setDescription('Segnala malfunzionamenti o anomalie tecniche').setEmoji('🐛'),
                    new StringSelectMenuOptionBuilder().setLabel('Segnalazioni').setValue('report').setDescription('Segnala violazioni di utenti o comportamenti scorretti').setEmoji('🚨')
                ])
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },

        async categoryHandler(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

        const type = interaction.values[0];
        const channelName = `︲🎫〞﹒${type}-${interaction.user.username}`;
        
        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
                { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ManageMessages] }
            ]
        });

        const data = getData();
        data[channel.id] = { 
            owner: interaction.user.id, 
            status: 'open', 
            lastMessage: Date.now(), 
            type, 
            claimedBy: null,
            questionnaire: {
                step: 0,
                answers: []
            }
        };
        saveData(data);

        const openLogEmbed = new EmbedBuilder()
            .setTitle("📂 NUOVO TICKET APERTO")
            .setDescription(`È stato creato un nuovo canale di supporto.`)
            .addFields(
                { name: "Utente", value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                { name: "Categoria", value: `\`${type.toUpperCase()}\``, inline: true },
                { name: "Canale", value: `${channel} (\`#${channel.name}\`)`, inline: false }
            )
            .setColor(0x00FF99)
            .setTimestamp();
        await sendSystemLog(interaction.guild, openLogEmbed);

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`🎫 BENVENUTO NEL SUPPORTO ── [${type.toUpperCase()}]`)
            .setDescription(
                `Gentile ${interaction.user},\n\n` +
                `Grazie per aver aperto una richiesta di assistenza nel reparto **${type.toUpperCase()}**.\n` +
                "Un membro del nostro Staff prende in carico le richieste nell'ordine di arrivo. Nel frattempo, segui le istruzioni sottostanti per velocizzare l'operazione.\n\n" +
                "📜 **Regolamento del Canale di Assistenza:**\n" +
                "1️⃣ **Non Pingare lo Staff:** I solleciti continui rallentano il supporto. Utilizza il pulsante `📢 Notifica Staff` solo se strettamente necessario.\n" +
                "2️⃣ **Sii Dettagliato:** Fornisci subito tutte le informazioni necessarie senza attendere che ti vengano chieste.\n" +
                "3️⃣ **Rispetto ed Educazione:** Mantiensiti educato. Linguaggio offensivo comporterà la chiusura e sanzioni."
            )
            .addFields(
                { name: "👤 Richiedente", value: `${interaction.user}`, inline: true },
                { name: "📂 Dipartimento", value: `\`${type.toUpperCase()}\``, inline: true },
                { name: "🔒 Stato Canale", value: "`Aperto & Riservato`", inline: true }
            )
            .setColor(0x00FF99)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "Elegance Sponsoring • Centro Supporto", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("🛡️ Prendi in Carico").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("ping_staff").setLabel("📢 Notifica Staff").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("🔒 Chiudi Ticket").setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, embeds: [welcomeEmbed], components: [row] });

        await channel.send({
            content: `🤖 **Assistente Virtuale Elegance:**\nCiao ${interaction.user}! Per permettere allo Staff di aiutarti nel minor tempo possibile, abbiamo avviato un rapido questionario di 3 domande per la categoria **${type.toUpperCase()}**.\n\n👉 **Digita \`inizia\` qui sotto in chat per avviare le domande.**`
        });

        return interaction.editReply({ content: `Ticket creato: ${channel}` });
    },

    async handleMessage(message) {
        if (message.author.bot) return;

        const data = getData();
        const ticket = data[message.channel.id];

        if (!ticket) return;

        ticket.lastMessage = Date.now();

        if (ticket.questionnaire && ticket.owner === message.author.id && ticket.questionnaire.step !== -1) {
            const q = ticket.questionnaire;
            const questions = CATEGORY_QUESTIONS[ticket.type] || CATEGORY_QUESTIONS['servizi'];

            if (q.step === 0) {
                if (message.content.trim().toLowerCase() === 'inizia') {
                    q.step = 1;
                    saveData(data);
                    await message.channel.send({ content: `✅ **Procedura Avviata!**\n\n**Domanda 1/3:** ${questions[0]}` });
                } else {
                    await message.channel.send({
                        content: `⚠️ **Attenzione:** Devi digitare esattamente \`inizia\` per far partire le domande guidate dell'assistenza!`
                    });
                }
                return;
            }

            if (q.step >= 1 && q.step <= 3) {
                q.answers.push({ question: questions[q.step - 1], answer: message.content });

                if (q.step < 3) {
                    q.step++;
                    saveData(data);
                    await message.channel.send({ content: `📝 **Risposta registrata!**\n\n**Domanda ${q.step}/3:** ${questions[q.step - 1]}` });
                } else {
                    q.step = -1;
                    saveData(data);

                    const summaryEmbed = new EmbedBuilder()
                        .setTitle(`📋 DATI RACCOLTI SUPPORTO ── [${ticket.type.toUpperCase()}]`)
                        .setDescription(`Di seguito sono riassunte le informazioni fornite dall'utente ${message.author}:`)
                        .setColor(0x3498db)
                        .setFooter({ text: "Elegance Support Assistant • Modulo compilato" })
                        .setTimestamp();

                    q.answers.forEach(item => {
                        summaryEmbed.addFields({ name: `❓ ${item.question}`, value: `💬 ${item.answer || "*Nessuna risposta*"}` });
                    });

                    await message.channel.send({ 
                        content: `✨ **Questionario completato con successo!** Le tue risposte sono state registrate. A breve un operatore prenderà in carico la richiesta.`, 
                        embeds: [summaryEmbed] 
                    });
                }
                return;
            }
        }

        saveData(data);
    },

    async buttonHandler(interaction) {
        const id = interaction.customId;
        const data = getData();
        const ticket = data[interaction.channel.id];
        
        if (!ticket) {
            const errText = "❌ **Errore:** Impossibile trovare i dati del ticket.";
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: errText });
            return interaction.reply({ content: errText, flags: MessageFlags.Ephemeral });
        }

        if (id === 'ping_staff') {
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                const msg = "⏳ **Cooldown:** Puoi sollecitare lo staff solo una volta ogni 24 ore.";
                if (interaction.deferred || interaction.replied) return interaction.editReply({ content: msg });
                return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
            }
            ticket.lastPing = Date.now();
            saveData(data);
            
            await interaction.channel.send({ 
                content: `📢 <@&${STAFF_ROLE_ID}> • L'utente **${interaction.user.username}** richiede l'intervento dello staff!` 
            });

            const pingLogEmbed = new EmbedBuilder()
                .setTitle("📢 SOLLECITO STAFF")
                .setDescription(`Sollecito nel canale ${interaction.channel}`)
                .addFields({ name: "Utente", value: `${interaction.user} (${interaction.user.tag})`, inline: true })
                .setColor(0xFFA500)
                .setTimestamp();
            await sendSystemLog(interaction.guild, pingLogEmbed);

            const okMsg = "✅ Sollecito inviato allo staff!";
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: okMsg });
            return interaction.reply({ content: okMsg, flags: MessageFlags.Ephemeral });
        }

        if (id === 'claim_ticket') {
            if (ticket.claimedBy) {
                const msg = `⚠️ **Attenzione:** Ticket già in carico a <@${ticket.claimedBy}>.`;
                if (interaction.deferred || interaction.replied) return interaction.editReply({ content: msg });
                return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
            }
            ticket.claimedBy = interaction.user.id;
            saveData(data);
            
            const claimLogEmbed = new EmbedBuilder()
                .setTitle("🛡️ TICKET PRESO IN CARICO")
                .setDescription(`Il ticket ${interaction.channel} è stato preso in carico.`)
                .addFields(
                    { name: "Staff", value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                    { name: "Canale", value: `${interaction.channel.name}`, inline: true }
                )
                .setColor(0x0099FF)
                .setTimestamp();
            await sendSystemLog(interaction.guild, claimLogEmbed);

            const msg = `🛡️ **Ticket Preso in Carico:** Gestito ora da ${interaction.user}.`;
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: msg });
            return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
        }

        if (id === 'close_ticket') {
            const startMsg = "🔒 **Chiusura avviata:** Generazione transcript...";
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: startMsg });
            } else {
                await interaction.reply({ content: startMsg, flags: MessageFlags.Ephemeral });
            }

            let transcriptBuffer = null;
            let transcriptFileName = `transcript-${interaction.channel.name}.txt`;

            try {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcript = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
                transcriptBuffer = Buffer.from(transcript, 'utf-8');
                
                const ownerUser = await interaction.guild.members.fetch(ticket.owner).catch(() => null);
                if (ownerUser) {
                    await ownerUser.send({
                        content: `📜 **Report Trascrizione Ticket**\nIl tuo ticket **[${ticket.type.toUpperCase()}]** in **${interaction.guild.name}** è stato chiuso.`,
                        files: [{ attachment: transcriptBuffer, name: transcriptFileName }]
                    }).catch(() => {});
                }
            } catch (err) {
                console.error("[ERROR_TRANSCRIPT]", err);
            }

            const closeLogEmbed = new EmbedBuilder()
                .setTitle("🔒 TICKET CHIUSO")
                .setDescription(`Canale \`#${interaction.channel.name}\` chiuso da ${interaction.user}.`)
                .addFields(
                    { name: "Categoria", value: `\`${ticket.type.toUpperCase()}\``, inline: true },
                    { name: "Creatore", value: `<@${ticket.owner}>`, inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            const logFiles = transcriptBuffer ? [{ attachment: transcriptBuffer, name: transcriptFileName }] : [];
            await sendSystemLog(interaction.guild, closeLogEmbed, logFiles);

            const ratingEmbed = new EmbedBuilder()
                .setTitle("⭐ VALUTAZIONE SUPPORTO")
                .setDescription("Valuta l'assistenza ricevuta cliccando su uno dei pulsanti:")
                .setColor(0xFFD700)
                .setTimestamp();

            const ratingRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rate_good').setLabel('⭐ Ottimo').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('rate_mid').setLabel('⭐ Medio').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('rate_bad').setLabel('⭐ Scadente').setStyle(ButtonStyle.Danger)
            );

            await interaction.channel.send({ embeds: [ratingEmbed], components: [ratingRow] }).catch(() => {});

            ticket.status = 'closed';
            saveData(data);

            const targetChannel = interaction.channel;
            if (targetChannel) {
                setTimeout(() => {
                    targetChannel.delete().catch(() => {});
                }, 5000);
            }
        }
    },

    async ratingHandler(interaction) {
        const ratingType = interaction.customId.replace('rate_', '').toUpperCase();
        
        const ratingLogEmbed = new EmbedBuilder()
            .setTitle("⭐ VALUTAZIONE RICEVUTA")
            .setDescription(`Valutazione per \`#${interaction.channel.name}\``)
            .addFields(
                { name: "Utente", value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                { name: "Valutazione", value: `**${ratingType}**`, inline: true }
            )
            .setColor(0xFFD700)
            .setTimestamp();
        await sendSystemLog(interaction.guild, ratingLogEmbed);

        const content = `⭐ **Grazie!** La tua valutazione è stata registrata.`;
        if (interaction.deferred || interaction.replied) return interaction.editReply({ content });
        return interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
};
                                               
