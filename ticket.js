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

// ⚙️ COSTANTI E ID DEL TUO SERVER
const DATA_PATH = './ticketsData.json';
const STAFF_ROLE_ID = "1528576030783176835";
const CATEGORY_ID = "1528582447443345560";
const ALLOWED_CHANNEL_ID = "1528576161959907348";
const LOG_CHANNEL_ID = "1528576197741772902";

// 🔄 GESTIONE DATABASE JSON
const getData = () => {
    try {
        if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '{}');
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '{}');
    } catch {
        return {};
    }
};
const saveData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));

// 📜 LOG DI SISTEMA
async function sendSystemLog(guild, embed, files = []) {
    try {
        const logChannel = await guild.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
        if (logChannel) await logChannel.send({ embeds: [embed], files });
    } catch (err) {
        console.error("[ERROR_LOG]", err);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Invia il pannello di assistenza Elegance Sponsoring'),

    // 1️⃣ PANNELLO PRINCIPALE (/ticket)
    async execute(interaction) {
        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            return interaction.reply({ 
                content: "❌ **Accesso Negato:** Comando non consentito in questo canale.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("✦ ELEGANCE SPONSORING ✦")
            .setDescription(
                "Welcome to the **Elegance Sponsoring Support Center**.\n" +
                "Select the appropriate department from the menu below to open a private request with our executive team.\n\n" +
                "**DIPARTIMENTI DISPONIBILI**\n" +
                "💎 `Servizi & VIP` — Assistenza acquisti, informazioni e pacchetti riservati.\n" +
                "🤝 `Partnership` — Proposte di collaborazione e sponsorizzazioni.\n" +
                "🐛 `Supporto Tecnico` — Segnalazione bug e problemi della piattaforma.\n" +
                "🚨 `Segnalazioni` — Report riservati verso utenti o condotta del server.\n\n" +
                "───────────────────────────────────\n" +
                "• *Fornisci tutti i dettagli pertinenti all'interno della richiesta.*\n" +
                "• *Si prega di non aprire ticket multipli per lo stesso motivo.*"
            )
            .setColor(0x1a1a1a)
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

    // 2️⃣ APERTURA TICKET DAL MENU A TENDINA
    async categoryHandler(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

        const type = interaction.values[0];
        const channelName = `︲🎫〞﹒${type}-${interaction.user.username}`;

        // Controllo ticket già aperto
        const data = getData();
        const userHasTicket = Object.keys(data).find(id => data[id].owner === interaction.user.id && data[id].status === 'open');
        if (userHasTicket) {
            return interaction.editReply({ content: `⚠️ Hai già una richiesta attiva nel sistema: <#${userHasTicket}>.` });
        }

        // Creazione canale ticket
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

        // Salvataggio nel DB JSON
        data[channel.id] = { 
            owner: interaction.user.id, 
            status: 'open', 
            lastMessage: Date.now(), 
            type, 
            claimedBy: null 
        };
        saveData(data);

        // LOG DI APERTURA (Pulito e Serio)
        const openLogEmbed = new EmbedBuilder()
            .setTitle("✦ NUOVA RICHIESTA APERTA ✦")
            .setDescription(
                `> Un nuovo ticket è stato inizializzato nel sistema.\n\n` +
                `• **Richiedente:** ${interaction.user} (\`${interaction.user.id}\`)\n` +
                `• **Dipartimento:** \`${type.toUpperCase()}\`\n` +
                `• **Canale:** ${channel}`
            )
            .setColor(0x2f3136)
            .setTimestamp();
        await sendSystemLog(interaction.guild, openLogEmbed);

        // EMBED BENVENUTO IN TICKET
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`✦ ASSISTENZA — ${type.toUpperCase()} ✦`)
            .setDescription(
                `Benvenuto ${interaction.user},\n` +
                `Un membro dell'Executive Team prenderà in carico la tua richiesta il prima possibile.\n\n` +
                `>>> *Spiega dettagliatamente la tua esigenza o il motivo dell'apertura per velocizzare la risoluzione.*`
            )
            .addFields(
                { name: "Richiedente", value: `${interaction.user}`, inline: true },
                { name: "Dipartimento", value: `\`${type.toUpperCase()}\``, inline: true },
                { name: "In Carico A", value: "`Non Assegnato`", inline: true }
            )
            .setColor(0x1a1a1a)
            .setFooter({ text: "Elegance Sponsoring • Management System", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        // MENU A TENDINA GESTIONE
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
    }

        // 3️⃣ GESTIONE SELEZIONI DAL MENU PRINCIPALE TICKET
    async manageMenuHandler(interaction) {
        const action = interaction.values[0];
        const data = getData();
        const ticket = data[interaction.channel.id];

        if (!ticket) {
            return interaction.reply({ 
                content: "❌ **Errore:** Impossibile recuperare le informazioni della sessione.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 🛡️ PRENDI IN CARICO
        if (action === 'action_claim') {
            if (ticket.claimedBy) {
                return interaction.reply({ 
                    content: `⚠️ Questa sessione è già in carico a <@${ticket.claimedBy}>.`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            ticket.claimedBy = interaction.user.id;
            saveData(data);

            const claimEmbed = new EmbedBuilder()
                .setTitle("✦ INCARICO ASSEGNATO ✦")
                .setDescription(`> La richiesta è stata presa in carico da ${interaction.user}.`)
                .setColor(0x2f3136);

            await interaction.channel.send({ embeds: [claimEmbed] });

            const log = new EmbedBuilder()
                .setTitle("✦ TICKET ASSEGNATO ✦")
                .setDescription(
                    `• **Operator:** ${interaction.user} (\`${interaction.user.id}\`)\n` +
                    `• **Canale:** ${interaction.channel}`
                )
                .setColor(0x2f3136)
                .setTimestamp();

            await sendSystemLog(interaction.guild, log);
            return interaction.reply({ content: "✅ Incarico registrato.", flags: MessageFlags.Ephemeral });
        }

        // 🔓 RILASCIA INCARICO
        if (action === 'action_unclaim') {
            if (!ticket.claimedBy) {
                return interaction.reply({ 
                    content: "⚠️ Questa sessione non ha un operatore assegnato.", 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const oldOperator = ticket.claimedBy;
            ticket.claimedBy = null;
            saveData(data);

            const unclaimEmbed = new EmbedBuilder()
                .setTitle("✦ INCARICO RILASCIATO ✦")
                .setDescription(`> ${interaction.user} ha rilasciato la gestione di questa richiesta.`)
                .setColor(0x2f3136);

            await interaction.channel.send({ embeds: [unclaimEmbed] });
            return interaction.reply({ content: "✅ Incarico rilasciato.", flags: MessageFlags.Ephemeral });
        }

        // 📢 SOLLECITA RISPOSTA
        if (action === 'action_ping') {
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                return interaction.reply({ 
                    content: "⏳ Puoi inviare un sollecito solo una volta ogni 24 ore.", 
                    flags: MessageFlags.Ephemeral 
                });
            }

            ticket.lastPing = Date.now();
            saveData(data);

            await interaction.channel.send({ 
                content: `📢 <@&${STAFF_ROLE_ID}> | **Sollecito di assistenza** inviato dall'utente ${interaction.user}.` 
            });

            return interaction.reply({ content: "✅ Sollecito inviato con successo.", flags: MessageFlags.Ephemeral });
        }

        // 🔄 TRASFERISCI DIPARTIMENTO
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

            return interaction.reply({
                content: "🔄 **Seleziona il nuovo dipartimento di destinazione:**",
                components: [transferRow],
                flags: MessageFlags.Ephemeral
            });
        }

        // ➕ AGGIUNGI MEMBRO
        if (action === 'action_add_user') {
            const modal = new ModalBuilder().setCustomId('ticket_modal_adduser').setTitle('Aggiungi Membro');
            const input = new TextInputBuilder()
                .setCustomId('user_id_input')
                .setLabel('ID o Menzione Utente')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Inserisci l\'ID dell\'utente...')
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        // ➖ RIMUOVI MEMBRO
        if (action === 'action_remove_user') {
            const modal = new ModalBuilder().setCustomId('ticket_modal_removeuser').setTitle('Rimuovi Membro');
            const input = new TextInputBuilder()
                .setCustomId('user_id_input')
                .setLabel('ID o Menzione Utente')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Inserisci l\'ID dell\'utente...')
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        // 🔒 CHIUDI E ARCHIVIA
        if (action === 'action_close') {
            await interaction.reply({ 
                content: "🔒 **Chiusura avviata.** Generazione della trascrizione in corso...", 
                flags: MessageFlags.Ephemeral 
            });

            let transcriptBuffer = null;
            let transcriptFileName = `transcript-${interaction.channel.name}.txt`;

            try {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcript = messages
                    .reverse()
                    .map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.cleanContent}`)
                    .join('\n');

                transcriptBuffer = Buffer.from(transcript, 'utf-8');

                // Invio Transcript in DM (Stile Elegance)
                const ownerUser = await interaction.guild.members.fetch(ticket.owner).catch(() => null);
                if (ownerUser) {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle("✦ RIEPILOGO RICHIESTA ✦")
                        .setDescription(
                            `Gentile **${ownerUser.user.username}**,\n` +
                            `La tua sessione di supporto su **${interaction.guild.name}** è stata conclusa.\n\n` +
                            `>>> In allegato trovi il file completo di trascrizione della conversazione.`
                        )
                        .addFields(
                            { name: "Canale", value: `\`${interaction.channel.name}\``, inline: true },
                            { name: "Chiuso Da", value: `${interaction.user}`, inline: true }
                        )
                        .setColor(0x1a1a1a)
                        .setFooter({ text: "Elegance Sponsoring • Support Archive" })
                        .setTimestamp();

                    await ownerUser.send({ 
                        embeds: [dmEmbed], 
                        files: [{ attachment: transcriptBuffer, name: transcriptFileName }] 
                    }).catch(() => {});
                }
            } catch (err) {
                console.error("[ERROR_TRANSCRIPT]", err);
            }

            // Log di Chiusura
            const closeLogEmbed = new EmbedBuilder()
                .setTitle("✦ SESSIONE ARCHIVIATA ✦")
                .setDescription(
                    `• **Dipartimento:** \`${ticket.type.toUpperCase()}\`\n` +
                    `• **Richiedente:** <@${ticket.owner}>\n` +
                    `• **Chiuso Da:** ${interaction.user} (\`${interaction.user.id}\`)`
                )
                .setColor(0x1a1a1a)
                .setTimestamp();

            const logFiles = transcriptBuffer ? [{ attachment: transcriptBuffer, name: transcriptFileName }] : [];
            await sendSystemLog(interaction.guild, closeLogEmbed, logFiles);

            ticket.status = 'closed';
            saveData(data);

            const targetChannel = interaction.channel;
            if (targetChannel) setTimeout(() => targetChannel.delete().catch(() => {}), 4000);
        }
    },

    // 4️⃣ ESECUZIONE TRASFERIMENTO
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
            .setTitle("✦ DIPARTIMENTO AGGIORNATO ✦")
            .setDescription(`> Il ticket è stato trasferito con successo nel reparto \`${newType.toUpperCase()}\`.`)
            .setColor(0x2f3136);

        await interaction.channel.send({ embeds: [transferEmbed] });
        return interaction.reply({ content: `✅ Trasferimento completato.`, flags: MessageFlags.Ephemeral });
    },

    // 5️⃣ GESTIONE MODALI (AGGIUNGI / RIMUOVI UTENTE)
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

            return interaction.reply({ content: `✅ L'utente ${targetMember} è stato aggiunto alla sessione.` });
        }

        if (id === 'ticket_modal_removeuser') {
            const raw = interaction.fields.getTextInputValue('user_id_input').replace(/[<@!>]/g, '');
            const targetMember = await interaction.guild.members.fetch(raw).catch(() => null);

            if (!targetMember) {
                return interaction.reply({ content: "❌ Utente non trovato nel server.", flags: MessageFlags.Ephemeral });
            }

            await interaction.channel.permissionOverwrites.delete(targetMember.id);
            return interaction.reply({ content: `✅ L'utente ${targetMember} è stato rimosso dalla sessione.` });
        }
    }
};
            
