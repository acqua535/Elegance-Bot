const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionFlagsBits, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder, 
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags 
} = require('discord.js');
const fs = require('fs');

const DATA_PATH = './ticketsData.json';
const STAFF_ROLE_ID = "1528576030783176835";
const CATEGORY_ID = "1528582447443345560";
const ALLOWED_CHANNEL_ID = "1528576161959907348";
const LOG_CHANNEL_ID = "1528576197741772902";
const REVIEW_CHANNEL_ID = "1544696093336539298";

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
        if (logChannel) await logChannel.send({ embeds: [embed], files });
    } catch (err) {
        console.error("[ERROR_LOG]", err);
    }
}

// ==========================================
// PARTE 1: COMANDO PRINCIPALE, CREAZIONE & UTENTI
// ==========================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Invia il pannello di assistenza Elegance Sponsoring'),

    async execute(interaction) {
        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            return interaction.reply({ 
                content: "❌ **Accesso Negato:** Comando non consentito in questo canale.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("🌐 CENTRO SUPPORTO ELEGANCE")
            .setDescription(
                "Benvenuto nel portale di assistenza di **Elegance Sponsoring**.\n" +
                "Scegli il reparto più adatto dal menu a tendina qui sotto per aprire una richiesta privata con noi.\n"
            )
            .addFields(
                { name: "💎 Servizi & VIP", value: "Info su pacchetti e vantaggi offerti alla community.", inline: false },
                { name: "🤝 Partnership", value: "Valutazione proposte commerciali e collaborazioni.", inline: false },
                { name: "💻 Supporto Tecnico", value: "Assistenza per malfunzionamenti, bug ed errori.", inline: false },
                { name: "🔒 Segnalazioni", value: "Modulo di report riservato per la sicurezza del server.", inline: false },
            )
            .setColor(0x00C8FF)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: "Elegance Sponsoring • Official Support Portal", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('Seleziona il reparto desiderato...')
                .addOptions([
                    new StringSelectMenuOptionBuilder().setLabel('Servizi & VIP').setValue('servizi').setDescription('Pacchetti VIP e acquisti').setEmoji('💎'),
                    new StringSelectMenuOptionBuilder().setLabel('Partnership').setValue('partner').setDescription('Candidature e proposte commerciali').setEmoji('🤝'),
                    new StringSelectMenuOptionBuilder().setLabel('Supporto Tecnico').setValue('bug').setDescription('Segnalazione errori o malfunzionamenti').setEmoji('🐛'),
                    new StringSelectMenuOptionBuilder().setLabel('Segnalazioni').setValue('report').setDescription('Report riservati utenti o server').setEmoji('🚨')
                ])
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },

    async categoryHandler(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

        const type = interaction.values[0];
        const data = getData();

        const activeTicketKey = Object.keys(data).find(channelId => data[channelId].owner === interaction.user.id && data[channelId].status === 'open');
        
        if (activeTicketKey) {
            const existingChannel = await interaction.guild.channels.fetch(activeTicketKey).catch(() => null);
            if (existingChannel) {
                return interaction.editReply({ content: `⚠️ Hai già una richiesta attiva nel sistema: ${existingChannel}.` });
            } else {
                data[activeTicketKey].status = 'closed';
                saveData(data);
            }
        }

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

        data[channel.id] = { 
            owner: interaction.user.id, 
            status: 'open', 
            lastMessage: Date.now(), 
            type, 
            claimedBy: null 
        };
        saveData(data);

        const openLogEmbed = new EmbedBuilder()
            .setTitle("📋 Nuova Richiesta Aperta")
            .addFields(
                { name: "👤 Richiedente", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                { name: "📁 Dipartimento", value: `\`${type.toUpperCase()}\``, inline: true },
                { name: "📌 Canale", value: `${channel}`, inline: true }
            )
            .setColor(0x00C8FF)
            .setTimestamp();
        await sendSystemLog(interaction.guild, openLogEmbed);

        const welcomeEmbed = new EmbedBuilder()
            .setTitle("💬 RICHIESTA DI SUPPORTO AVVIATA")
            .setDescription(
                `Benvenuto ${interaction.user}!\n` +
                `Il tuo ticket è ora attivo. 🚀\n\n` +
                `✍️ Scrivi pure un messaggio specificando la tua richiesta: il nostro team analizzerà la situazione e ti risponderà al più presto.`
            )
            .addFields(
                { name: "👤 Utente", value: `${interaction.user}`, inline: true },
                { name: "📁 Dipartimento", value: `\`${type.toUpperCase()}\``, inline: true },
                { name: "🛡️ In Carico A", value: "`Non Assegnato`", inline: true }
            )
            .setColor(0x00C8FF)
            .setFooter({ text: "Elegance Sponsoring • Management System", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const manageMenuRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_manage_menu')
                .setPlaceholder('Opzioni e Gestione Ticket...')
                .addOptions([
                    new StringSelectMenuOptionBuilder().setLabel('Prendi in Carico').setValue('action_claim').setDescription('Assegna la gestione di questa sessione').setEmoji('🛡️'),
                    new StringSelectMenuOptionBuilder().setLabel('Rilascia Incarico').setValue('action_unclaim').setDescription('Rimuovi l\'assegnazione attuale').setEmoji('🔓'),
                    new StringSelectMenuOptionBuilder().setLabel('Sollecita Risposta').setValue('action_ping').setDescription('Notifica lo Staff (priorità alta)').setEmoji('📢'),
                    new StringSelectMenuOptionBuilder().setLabel('Trasferisci Dipartimento').setValue('action_transfer').setDescription('Sposta in un altra categoria').setEmoji('🔄'),
                    new StringSelectMenuOptionBuilder().setLabel('Aggiungi Membro').setValue('action_add_user').setDescription('Dai accesso al canale a un utente').setEmoji('➕'),
                    new StringSelectMenuOptionBuilder().setLabel('Rimuovi Membro').setValue('action_remove_user').setDescription('Rimuovi l\'accesso al canale').setEmoji('➖'),
                    new StringSelectMenuOptionBuilder().setLabel('Chiudi e Archivia').setValue('action_close').setDescription('Termina la sessione di supporto').setEmoji('🔒')
                ])
        );

        await channel.send({ 
            content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, 
            embeds: [welcomeEmbed], 
            components: [manageMenuRow] 
        });

        return interaction.editReply({ content: `✅ **Canale creato:** ${channel}` });
    },

    async modalHandler(interaction) {
        const id = interaction.customId;

        if (id === 'ticket_modal_adduser') {
            const raw = interaction.fields.getTextInputValue('user_id_input').replace(/[<@!>]/g, '');
            const targetMember = await interaction.guild.members.fetch(raw).catch(() => null);

            if (!targetMember) {
                return interaction.reply({ content: "❌ Utente non trovato nel server.", flags: MessageFlags.Ephemeral });
            }

            await interaction.channel.permissionOverwrites.edit(targetMember.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true
            });

            const log = new EmbedBuilder()
                .setTitle("📋 Utente Aggiunto al Ticket")
                .addFields(
                    { name: "👤 Utente", value: `${targetMember} (\`${targetMember.id}\`)`, inline: true },
                    { name: "🛡️ Aggiunto Da", value: `${interaction.user}`, inline: true },
                    { name: "📌 Canale", value: `${interaction.channel}`, inline: true }
                )
                .setColor(0x00C8FF)
                .setTimestamp();
            await sendSystemLog(interaction.guild, log);

            return interaction.reply({ content: `✅ L'utente ${targetMember} è stato aggiunto alla sessione.` });
        }

        if (id === 'ticket_modal_removeuser') {
            const raw = interaction.fields.getTextInputValue('user_id_input').replace(/[<@!>]/g, '');
            const targetMember = await interaction.guild.members.fetch(raw).catch(() => null);

            if (!targetMember) {
                return interaction.reply({ content: "❌ Utente non trovato nel server.", flags: MessageFlags.Ephemeral });
            }

            await interaction.channel.permissionOverwrites.delete(targetMember.id);

            const log = new EmbedBuilder()
                .setTitle("📋 Utente Rimosso dal Ticket")
                .addFields(
                    { name: "👤 Utente", value: `${targetMember} (\`${targetMember.id}\`)`, inline: true },
                    { name: "🛡️ Rimosso Da", value: `${interaction.user}`, inline: true },
                    { name: "📌 Canale", value: `${interaction.channel}`, inline: true }
                )
                .setColor(0x00C8FF)
                .setTimestamp();
            await sendSystemLog(interaction.guild, log);

            return interaction.reply({ content: `✅ L'accesso è stato rimosso per ${targetMember}.` });
        }
    },

        // ==========================================
    // PARTE 2: GESTIONE AZIONI, LOG & RECENSIONI
    // ==========================================
    async manageMenuHandler(interaction) {
        const action = interaction.values[0];
        const data = getData();
        const ticket = data[interaction.channel.id];

        if (!ticket) {
            return interaction.reply({ content: "❌ **Errore:** Impossibile recuperare le informazioni della sessione.", flags: MessageFlags.Ephemeral });
        }

        if (action === 'action_claim') {
            if (ticket.claimedBy) {
                return interaction.reply({ content: `⚠️ Questa sessione è già in carico a <@${ticket.claimedBy}>.`, flags: MessageFlags.Ephemeral });
            }

            ticket.claimedBy = interaction.user.id;
            saveData(data);

            const claimEmbed = new EmbedBuilder()
                .setTitle("🛡️ INCARICO ASSEGNATO")
                .setDescription(`La richiesta è stata presa in carico da ${interaction.user}.`)
                .setColor(0x00C8FF);
            await interaction.channel.send({ embeds: [claimEmbed] });

            const log = new EmbedBuilder()
                .setTitle("📋 Ticket Preso in Carico")
                .addFields(
                    { name: "🛡️ Operatore", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                    { name: "📌 Canale", value: `${interaction.channel}`, inline: true }
                )
                .setColor(0x00C8FF)
                .setTimestamp();
            await sendSystemLog(interaction.guild, log);

            return interaction.reply({ content: "✅ Incarico registrato.", flags: MessageFlags.Ephemeral });
        }

        if (action === 'action_unclaim') {
            if (!ticket.claimedBy) {
                return interaction.reply({ content: "⚠️ Questa sessione non ha un operatore assegnato.", flags: MessageFlags.Ephemeral });
            }

            ticket.claimedBy = null;
            saveData(data);

            const unclaimEmbed = new EmbedBuilder()
                .setTitle("🔓 INCARICO RILASCIATO")
                .setDescription(`${interaction.user} ha rilasciato la gestione di questa richiesta.`)
                .setColor(0x00C8FF);
            await interaction.channel.send({ embeds: [unclaimEmbed] });

            const log = new EmbedBuilder()
                .setTitle("📋 Ticket Rilasciato")
                .addFields(
                    { name: "🛡️ Operatore", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                    { name: "📌 Canale", value: `${interaction.channel}`, inline: true }
                )
                .setColor(0x00C8FF)
                .setTimestamp();
            await sendSystemLog(interaction.guild, log);

            return interaction.reply({ content: "✅ Incarico rilasciato.", flags: MessageFlags.Ephemeral });
        }

        if (action === 'action_ping') {
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                return interaction.reply({ content: "⏳ Puoi inviare un sollecito solo una volta ogni 24 ore.", flags: MessageFlags.Ephemeral });
            }

            ticket.lastPing = Date.now();
            saveData(data);

            await interaction.channel.send({ content: `📢 <@&${STAFF_ROLE_ID}> | **Sollecito di assistenza** inviato dall'utente ${interaction.user}.` });

            const log = new EmbedBuilder()
                .setTitle("📋 Sollecito Inviato nel Ticket")
                .addFields(
                    { name: "👤 Utente", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                    { name: "📌 Canale", value: `${interaction.channel}`, inline: true }
                )
                .setColor(0x00C8FF)
                .setTimestamp();
            await sendSystemLog(interaction.guild, log);

            return interaction.reply({ content: "✅ Sollecito inviato con successo.", flags: MessageFlags.Ephemeral });
        }

        if (action === 'action_transfer') {
            const transferRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_transfer_select')
                    .setPlaceholder('Seleziona la nuova destinazione...')
                    .addOptions([
                        new StringSelectMenuOptionBuilder().setLabel('Servizi & VIP').setValue('servizi').setEmoji('💎'),
                        new StringSelectMenuOptionBuilder().setLabel('Partnership').setValue('partner').setEmoji('🤝'),
                        new StringSelectMenuOptionBuilder().setLabel('Supporto Tecnico').setValue('bug').setEmoji('🐛'),
                        new StringSelectMenuOptionBuilder().setLabel('Segnalazioni').setValue('report').setEmoji('🚨')
                    ])
            );
            return interaction.reply({ content: "🔄 **Seleziona il nuovo dipartimento di destinazione:**", components: [transferRow], flags: MessageFlags.Ephemeral });
        }

        if (action === 'action_add_user') {
            const modal = new ModalBuilder().setCustomId('ticket_modal_adduser').setTitle('Aggiungi Membro');
            const input = new TextInputBuilder().setCustomId('user_id_input').setLabel('ID o Menzione Utente').setStyle(TextInputStyle.Short).setPlaceholder("Inserisci l'ID dell'utente...").setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        if (action === 'action_remove_user') {
            const modal = new ModalBuilder().setCustomId('ticket_modal_removeuser').setTitle('Rimuovi Membro');
            const input = new TextInputBuilder().setCustomId('user_id_input').setLabel('ID o Menzione Utente').setStyle(TextInputStyle.Short).setPlaceholder("Inserisci l'ID dell'utente...").setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        if (action === 'action_close') {
            await interaction.reply({ content: "🔒 **Chiusura avviata.** Generazione della trascrizione in corso...", flags: MessageFlags.Ephemeral });

            let transcriptBuffer = null;
            let transcriptFileName = `transcript-${interaction.channel.name}.txt`;

            try {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcript = messages
                    .reverse()
                    .map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.cleanContent}`)
                    .join('\n');

                transcriptBuffer = Buffer.from(transcript, 'utf-8');

                const ownerUser = await interaction.guild.members.fetch(ticket.owner).catch(() => null);
                if (ownerUser) {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle("📂 RIEPILOGO RICHIESTA DI SUPPORTO")
                        .setDescription(
                            `Gentile **${ownerUser.user.username}**,\n` +
                            `La tua sessione nel server **${interaction.guild.name}** è stata archiviata.\n\n` +
                            `In allegato trovi il file di trascrizione completo della conversazione.\n\n` +
                            `✨ **Ti è piaciuto il nostro servizio?**\n` +
                            `Lascia una recensione rapida cliccando sul pulsante qui sotto per aiutarci a migliorare!`
                        )
                        .addFields(
                            { name: "📌 Canale", value: `\`${interaction.channel.name}\``, inline: true },
                            { name: "🛡️ Gestito Da", value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : "`Non Assegnato`", inline: true }
                        )
                        .setColor(0x00C8FF)
                        .setFooter({ text: "Elegance Sponsoring • Sistema Feedback", iconURL: interaction.guild.iconURL() })
                        .setTimestamp();

                    const reviewButtonRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`open_review_modal_${ticket.claimedBy || 'none'}`)
                            .setLabel('Lascia una Recensione')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('⭐')
                    );

                    await ownerUser.send({ 
                        embeds: [dmEmbed], 
                        components: [reviewButtonRow],
                        files: [{ attachment: transcriptBuffer, name: transcriptFileName }] 
                    }).catch(() => {});
                }
            } catch (err) {
                console.error("[ERROR_TRANSCRIPT]", err);
            }

            const closeLogEmbed = new EmbedBuilder()
                .setTitle("📋 Sessione Archiviata")
                .addFields(
                    { name: "📁 Dipartimento", value: `\`${ticket.type.toUpperCase()}\``, inline: true },
                    { name: "👤 Richiedente", value: `<@${ticket.owner}>`, inline: true },
                    { name: "🛡️ Operatore", value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : "`Nessuno`", inline: true },
                    { name: "🔒 Chiuso Da", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true }
                )
                .setColor(0x00C8FF)
                .setTimestamp();

            const logFiles = transcriptBuffer ? [{ attachment: transcriptBuffer, name: transcriptFileName }] : [];
            await sendSystemLog(interaction.guild, closeLogEmbed, logFiles);

            ticket.status = 'closed';
            saveData(data);

            const targetChannel = interaction.channel;
            if (targetChannel) setTimeout(() => targetChannel.delete().catch(() => {}), 4000);
        }
    },

    async transferHandler(interaction) {
        const newType = interaction.values[0];
        const data = getData();
        const ticket = data[interaction.channel.id];

        if (!ticket) {
            return interaction.reply({ content: "❌ Dati della sessione non trovati.", flags: MessageFlags.Ephemeral });
        }

        ticket.type = newType;
        saveData(data);

        const newName = `︲🎫〞﹒${newType}-${interaction.user.username}`;
        await interaction.channel.setName(newName).catch(() => {});

        const transferEmbed = new EmbedBuilder()
            .setTitle("🔄 DIPARTIMENTO AGGIORNATO")
            .setDescription(`Il ticket è stato trasferito con successo nel reparto \`${newType.toUpperCase()}\`.`)
            .setColor(0x00C8FF);
        await interaction.channel.send({ embeds: [transferEmbed] });

        const log = new EmbedBuilder()
            .setTitle("📋 Ticket Trasferito")
            .addFields(
                { name: "📁 Nuovo Dipartimento", value: `\`${newType.toUpperCase()}\``, inline: true },
                { name: "📌 Canale", value: `${interaction.channel}`, inline: true }
            )
            .setColor(0x00C8FF)
            .setTimestamp();
        await sendSystemLog(interaction.guild, log);

        return interaction.reply({ content: `✅ Trasferimento completato.`, flags: MessageFlags.Ephemeral });
    },

    async handleReviewButton(interaction) {
        if (!interaction.customId.startsWith('open_review_modal_')) return;

        const staffId = interaction.customId.split('_')[3];

        const modal = new ModalBuilder()
            .setCustomId(`submit_review_modal_${staffId}`)
            .setTitle('⭐ Recensione Supporto');

        const ratingInput = new TextInputBuilder()
            .setCustomId('review_rating')
            .setLabel('Voto (Inserisci un numero da 1 a 5)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Es: 5')
            .setMinLength(1)
            .setMaxLength(1)
            .setRequired(true);

        const detailsInput = new TextInputBuilder()
            .setCustomId('review_details')
            .setLabel('Dettagli nella recensione')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Scrivi cosa ne pensi del servizio ricevuto...')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(ratingInput),
            new ActionRowBuilder().addComponents(detailsInput)
        );

        await interaction.showModal(modal);
    },

    async handleReviewSubmit(interaction) {
        if (!interaction.customId.startsWith('submit_review_modal_')) return;

        const staffId = interaction.customId.split('_')[3];
        const ratingStr = interaction.fields.getTextInputValue('review_rating').trim();
        const details = interaction.fields.getTextInputValue('review_details');

        const rating = parseInt(ratingStr);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            return interaction.reply({
                content: "❌ **Errore:** Il voto deve essere un numero compreso tra **1** e **5**.",
                flags: MessageFlags.Ephemeral
            });
        }

        const starsMap = {
            1: "⭐☆☆☆☆ (1/5)",
            2: "⭐⭐☆☆☆ (2/5)",
            3: "⭐⭐⭐☆☆ (3/5)",
            4: "⭐⭐⭐⭐☆ (4/5)",
            5: "⭐⭐⭐⭐⭐ (5/5)"
        };
        const starsVisual = starsMap[rating] || "⭐⭐⭐⭐⭐";

        await interaction.reply({
            content: "✅ **Grazie mille!** La tua recensione è stata inviata con successo nel canale dedicato.",
            flags: MessageFlags.Ephemeral
        });

        try {
            const reviewChannel = await interaction.client.channels.fetch(REVIEW_CHANNEL_ID).catch(() => null);
            if (!reviewChannel) return;

            const reviewEmbed = new EmbedBuilder()
                .setTitle("✨ NUOVA RECENSIONE SUPPORTO")
                .setColor(rating >= 4 ? 0x00FF99 : rating === 3 ? 0xFFCC00 : 0xFF3333)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`Un utente ha espresso la propria opinione sulla qualità del supporto ricevuto.`)
                .addFields(
                    { name: "👤 Utente", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                    { name: "🛡️ Staff in Carico", value: staffId !== 'none' ? `<@${staffId}>` : "`Non Specificato / Recensione libera`", inline: true },
                    { name: "🏆 Valutazione", value: `**${starsVisual}**`, inline: false },
                    { name: "📝 Dettagli nella recensione", value: `${details}`, inline: false }
                )
                .setFooter({ text: "Elegance Sponsoring • Customer Feedback", iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await reviewChannel.send({ embeds: [reviewEmbed] });
        } catch (err) {
            console.error("[ERROR_REVIEW_SEND]", err);
        }
    }
};
                
