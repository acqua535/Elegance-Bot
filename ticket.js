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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Invia il pannello principale per la gestione dei ticket'),

    async execute(interaction) {
        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            return interaction.reply({ 
                content: "❌ **Accesso Negato:** Comando non consentito in questo canale.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("✨ ✦ ELEGANCE SPONSORING ✦ ✨")
            .setDescription(
                "### 🛡️ CENTRO ASSISTENZA & SUPPORTO\n" +
                "> *Benvenuto nel nostro portale dedicato. Seleziona il reparto idoneo dal menu sottostante per aprire una sessione privata con lo Staff.*\n\n" +
                "╭━━━ 📂 **DIPARTIMENTI ATTIVI**\n" +
                "┣ 💎 **` VIP & SERVIZI `** ── *Info, acquisti e supporto dedicato*\n" +
                "┣ 🤝 **` PARTNERSHIP `** ── *Proposte di sponsor e collaborazioni*\n" +
                "┣ 🐛 **` BUG & TECNICA `** ── *Segnalazione errori e problemi bot*\n" +
                "┗ 🚨 **` SEGNALAZIONI `** ── *Report riservati utenti o server*\n\n" +
                "╭━━━ 📋 **LINEE GUIDA OBBLIGATORIE**\n" +
                "┣ ► Descrivi la tua richiesta direttamente all'interno del canale aperto.\n" +
                "┣ ► Non aprire ticket multipli per la stessa richiesta.\n" +
                "┗ ► L'apertura di ticket spazzatura comporta il ban dal supporto.\n\n" +
                "```fix\n" +
                "⚡ Lo Staff risponderà nel minor tempo possibile.\n" +
                "```"
            )
            .setColor(0x2b2d31)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: "Elegance Sponsoring • Official Support System", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('⚡ Seleziona il reparto di assistenza...')
                .addOptions([
                    new StringSelectMenuOptionBuilder().setLabel('Servizi & VIP').setValue('servizi').setDescription('Richiedi assistenza per pacchetti VIP o acquisti').setEmoji('💎'),
                    new StringSelectMenuOptionBuilder().setLabel('Partnership').setValue('partner').setDescription('Invia la tua candidatura o proposta commerciale').setEmoji('🤝'),
                    new StringSelectMenuOptionBuilder().setLabel('Bug & Tecnica').setValue('bug').setDescription('Segnala malfunzionamenti tecnici o problemi').setEmoji('🐛'),
                    new StringSelectMenuOptionBuilder().setLabel('Segnalazioni').setValue('report').setDescription('Segnala violazioni di utenti o server').setEmoji('🚨')
                ])
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },

    // APERTURA TICKET DIRETTA
    async categoryHandler(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

        const type = interaction.values[0];
        const channelName = `🎫︲${type}-${interaction.user.username}`;

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
            claimedBy: null 
        };
        saveData(data);

        // LOG DI APERTURA
        const openLogEmbed = new EmbedBuilder()
            .setTitle("📂 ✦ TICKET CREATO ✦")
            .setDescription(
                "```yaml\n" +
                "  NUOVO TICKET APERTO NEL SISTEMA\n" +
                "```\n" +
                "╭━━━ 📋 **DETTAGLI SESSIONE**\n" +
                `┣ 👤 **Utente:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
                `┣ 📂 **Categoria:** \`${type.toUpperCase()}\`\n` +
                `┗ 📌 **Canale:** ${channel} (\`#${channel.name}\`)\n`
            )
            .setColor(0x00FF99)
            .setTimestamp();
        await sendSystemLog(interaction.guild, openLogEmbed);

        // EMBED BENVENUTO
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`✨ ✦ ASSISTENZA DEDICATA ✦ ✨`)
            .setDescription(
                `### 🎫 REPARTO ATTUALE: \`${type.toUpperCase()}\`\n` +
                `> *Ciao ${interaction.user}, benvenuto nel tuo ticket. Un membro dello Staff prenderà in carico la richiesta a breve. Spiega pure di cosa hai bisogno.*\n\n` +
                "╭━━━ 📜 **INFORMATIVA & REGOLAMENTO**\n" +
                "┣ 🛑 **No Ping Inutili:** Non menzionare lo Staff senza un valido motivo.\n" +
                "┣ 📢 **Sollecita Staff:** Usa la funzione solo in caso di urgenza (max 1/24h).\n" +
                "┗ 🤝 **Linguaggio:** Mantieni sempre un tono idoneo ed educato.\n"
            )
            .addFields(
                { name: "👤 **Richiedente**", value: `${interaction.user}`, inline: true },
                { name: "📂 **Dipartimento**", value: `\`${type.toUpperCase()}\``, inline: true },
                { name: "🔒 **In Carico A**", value: "`Nessuno`", inline: true }
            )
            .setColor(0x2b2d31)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "Elegance Sponsoring • Support Control Center", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        // MENU A TENDINA UNICO
        const manageMenuRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_manage_menu')
                .setPlaceholder('⚙️ Menu Gestione Ticket...')
                .addOptions([
                    new StringSelectMenuOptionBuilder().setLabel('Reclama Ticket').setValue('action_claim').setDescription('Prendi in carico la gestione del ticket').setEmoji('🛡️'),
                    new StringSelectMenuOptionBuilder().setLabel('Rilascia Ticket').setValue('action_unclaim').setDescription('Rilascia il ticket se non puoi più gestirlo').setEmoji('🔓'),
                    new StringSelectMenuOptionBuilder().setLabel('Sollecita Staff').setValue('action_ping').setDescription('Invia una notifica prioritaria allo Staff').setEmoji('📢'),
                    new StringSelectMenuOptionBuilder().setLabel('Trasferisci Reparto').setValue('action_transfer').setDescription('Sposta il ticket in una nuova categoria').setEmoji('🔄'),
                    new StringSelectMenuOptionBuilder().setLabel('Aggiungi Utente').setValue('action_add_user').setDescription('Aggiungi un membro a questo canale').setEmoji('➕'),
                    new StringSelectMenuOptionBuilder().setLabel('Rimuovi Utente').setValue('action_remove_user').setDescription('Rimuovi un membro da questo canale').setEmoji('➖'),
                    new StringSelectMenuOptionBuilder().setLabel('Chiudi Ticket').setValue('action_close').setDescription('Archivia e chiudi definitivamente il ticket').setEmoji('🔒')
                ])
        );

        await channel.send({ 
            content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, 
            embeds: [welcomeEmbed], 
            components: [manageMenuRow] 
        });

        return interaction.editReply({ content: `✅ **Ticket creato con successo!** Accedi al canale: ${channel}` });
    },

        // HANDLER DEI SELETTORI A TENDINA
    async manageMenuHandler(interaction) {
        const action = interaction.values[0];
        const data = getData();
        const ticket = data[interaction.channel.id];

        if (!ticket) {
            return interaction.reply({ content: "❌ Impossibile recuperare i dati del ticket.", flags: MessageFlags.Ephemeral });
        }

        // --- 🛡️ RECLAMA TICKET ---
        if (action === 'action_claim') {
            if (ticket.claimedBy) {
                return interaction.reply({ content: `⚠️ Ticket già preso in carico da <@${ticket.claimedBy}>.`, flags: MessageFlags.Ephemeral });
            }
            ticket.claimedBy = interaction.user.id;
            saveData(data);

            const claimEmbed = new EmbedBuilder()
                .setDescription(`🛡️ **Ticket Preso in Carico:** Da questo momento l'assistenza è gestita da ${interaction.user}.`)
                .setColor(0x0099FF);
            await interaction.channel.send({ embeds: [claimEmbed] });

            const log = new EmbedBuilder()
                .setTitle("🛡️ ✦ TICKET PRESO IN CARICO ✦")
                .setDescription(`╭━━━ 📋 **DETTAGLI**\n┣ 👤 **Staffer:** ${interaction.user}\n┗ 📌 **Canale:** \`#${interaction.channel.name}\``)
                .setColor(0x0099FF).setTimestamp();
            await sendSystemLog(interaction.guild, log);

            return interaction.reply({ content: "✅ Hai preso in carico il ticket.", flags: MessageFlags.Ephemeral });
        }

        // --- 🔓 RILASCIA TICKET ---
        if (action === 'action_unclaim') {
            if (!ticket.claimedBy) {
                return interaction.reply({ content: "⚠️ Questo ticket non è stato ancora reclamato.", flags: MessageFlags.Ephemeral });
            }
            const old = ticket.claimedBy;
            ticket.claimedBy = null;
            saveData(data);

            const unclaimEmbed = new EmbedBuilder()
                .setDescription(`🔓 **Ticket Rilasciato:** L'assistenza non è più in carico a <@${old}> ed è nuovamente disponibile.`)
                .setColor(0xE67E22);
            await interaction.channel.send({ embeds: [unclaimEmbed] });

            return interaction.reply({ content: "🔓 Ticket rilasciato con successo.", flags: MessageFlags.Ephemeral });
        }

        // --- 📢 SOLLECITA STAFF ---
        if (action === 'action_ping') {
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                return interaction.reply({ content: "⏳ Puoi sollecitare lo Staff soltanto una volta ogni 24 ore.", flags: MessageFlags.Ephemeral });
            }
            ticket.lastPing = Date.now();
            saveData(data);

            await interaction.channel.send({ content: `📢 <@&${STAFF_ROLE_ID}> • L'utente **${interaction.user.username}** ha richiesto un sollecito per questo ticket!` });
            return interaction.reply({ content: "📢 Notifica inviata allo Staff!", flags: MessageFlags.Ephemeral });
        }

        // --- 🔄 TRASFERISCI REPARTO ---
        if (action === 'action_transfer') {
            const transferRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_transfer_select')
                    .setPlaceholder('🔄 Seleziona la nuova categoria...')
                    .addOptions([
                        new StringSelectMenuOptionBuilder().setLabel('Servizi & VIP').setValue('servizi').setEmoji('💎'),
                        new StringSelectMenuOptionBuilder().setLabel('Partnership').setValue('partner').setEmoji('🤝'),
                        new StringSelectMenuOptionBuilder().setLabel('Bug & Tecnica').setValue('bug').setEmoji('🐛'),
                        new StringSelectMenuOptionBuilder().setLabel('Segnalazioni').setValue('report').setEmoji('🚨')
                    ])
            );

            return interaction.reply({
                content: "🔄 **Seleziona la nuova categoria in cui trasferire il ticket:**",
                components: [transferRow],
                flags: MessageFlags.Ephemeral
            });
        }

        // --- ➕ AGGIUNGI UTENTE (MODALE) ---
        if (action === 'action_add_user') {
            const modal = new ModalBuilder().setCustomId('ticket_modal_adduser').setTitle('➕ AGGIUNGI UTENTE');
            const input = new TextInputBuilder()
                .setCustomId('user_id_input')
                .setLabel('Inserisci ID Utente o Menzione:')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Es: 123456789012345678')
                .setMaxLength(40)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        // --- ➖ RIMUOVI UTENTE (MODALE) ---
        if (action === 'action_remove_user') {
            const modal = new ModalBuilder().setCustomId('ticket_modal_removeuser').setTitle('➖ RIMUOVI UTENTE');
            const input = new TextInputBuilder()
                .setCustomId('user_id_input')
                .setLabel('Inserisci ID Utente o Menzione:')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Es: 123456789012345678')
                .setMaxLength(40)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        // --- 🔒 CHIUDI TICKET ---
        if (action === 'action_close') {
            await interaction.reply({ content: "🔒 **Chiusura avviata:** Generazione transcript in corso...", flags: MessageFlags.Ephemeral });

            let transcriptBuffer = null;
            let transcriptFileName = `transcript-${interaction.channel.name}.txt`;

            try {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcript = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
                transcriptBuffer = Buffer.from(transcript, 'utf-8');
                
                const ownerUser = await interaction.guild.members.fetch(ticket.owner).catch(() => null);
                if (ownerUser) {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle("📜 ✦ REPORT TRASCRIZIONE TICKET ✦")
                        .setDescription(`Il tuo ticket nel server **${interaction.guild.name}** è stato chiuso.\nIn allegato trovi la trascrizione della conversazione.`)
                        .setColor(0x2b2d31).setTimestamp();

                    await ownerUser.send({ embeds: [dmEmbed], files: [{ attachment: transcriptBuffer, name: transcriptFileName }] }).catch(() => {});
                }
            } catch (err) {}

            const closeLogEmbed = new EmbedBuilder()
                .setTitle("🔒 ✦ TICKET CHIUSO ✦")
                .setDescription(`╭━━━ 📋 **DETTAGLI**\n┣ 📂 **Categoria:** \`${ticket.type.toUpperCase()}\`\n┣ 👤 **Richiedente:** <@${ticket.owner}>\n┗ 🛡️ **Chiuso Da:** ${interaction.user}`)
                .setColor(0xFF0000).setTimestamp();

            const logFiles = transcriptBuffer ? [{ attachment: transcriptBuffer, name: transcriptFileName }] : [];
            await sendSystemLog(interaction.guild, closeLogEmbed, logFiles);

            const ratingEmbed = new EmbedBuilder()
                .setTitle("⭐ ✦ VALUTAZIONE SUPPORTO ✦")
                .setDescription("### Come valuti l'assistenza ricevuta?\n> *Clicca su uno dei pulsanti sottostanti per esprimere un giudizio.*")
                .setColor(0xFFD700).setTimestamp();

            const ratingRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rate_good').setLabel('⭐ Ottimo').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('rate_mid').setLabel('⭐ Medio').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('rate_bad').setLabel('⭐ Scadente').setStyle(ButtonStyle.Danger)
            );

            await interaction.channel.send({ embeds: [ratingEmbed], components: [ratingRow] }).catch(() => {});

            ticket.status = 'closed';
            saveData(data);

            const targetChannel = interaction.channel;
            if (targetChannel) setTimeout(() => targetChannel.delete().catch(() => {}), 5000);
        }
    },

    // HANDLER ESECUZIONE TRASFERIMENTO REPARTO
    async transferHandler(interaction) {
        const newType = interaction.values[0];
        const data = getData();
        const ticket = data[interaction.channel.id];

        if (!ticket) return interaction.reply({ content: "❌ Dati ticket non trovati.", flags: MessageFlags.Ephemeral });

        ticket.type = newType;
        saveData(data);

        const newName = `🎫︲${newType}-${interaction.user.username}`;
        await interaction.channel.setName(newName).catch(() => {});

        const transferEmbed = new EmbedBuilder()
            .setDescription(`🔄 **Ticket Trasferito:** Il dipartimento di assistenza è stato cambiato in \`${newType.toUpperCase()}\`.`)
            .setColor(0x9B59B6);

        await interaction.channel.send({ embeds: [transferEmbed] });
        return interaction.reply({ content: `✅ Ticket trasferito con successo nella categoria \`${newType.toUpperCase()}\`.`, flags: MessageFlags.Ephemeral });
    },

    // GESTIONE DEI MODALI (Aggiungi/Rimuovi Utente)
    async modalHandler(interaction) {
        const id = interaction.customId;

        if (id === 'ticket_modal_adduser') {
            const raw = interaction.fields.getTextInputValue('user_id_input').replace(/[<@!>]/g, '');
            const targetMember = await interaction.guild.members.fetch(raw).catch(() => null);

            if (!targetMember) return interaction.reply({ content: "❌ Utente non trovato.", flags: MessageFlags.Ephemeral });

            await interaction.channel.permissionOverwrites.edit(targetMember.id, {
                ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true
            });

            return interaction.reply({ content: `✅ Utente ${targetMember} aggiunto con successo al ticket.` });
        }

        if (id === 'ticket_modal_removeuser') {
            const raw = interaction.fields.getTextInputValue('user_id_input').replace(/[<@!>]/g, '');
            const targetMember = await interaction.guild.members.fetch(raw).catch(() => null);

            if (!targetMember) return interaction.reply({ content: "❌ Utente non trovato.", flags: MessageFlags.Ephemeral });

            await interaction.channel.permissionOverwrites.delete(targetMember.id);

            return interaction.reply({ content: `➖ Utente ${targetMember} rimosso con successo dal ticket.` });
        }
    },

    async ratingHandler(interaction) {
        const ratingType = interaction.customId.replace('rate_', '').toUpperCase();
        
        const ratingLogEmbed = new EmbedBuilder()
            .setTitle("⭐ ✦ NUOVA VALUTAZIONE ✦")
            .setDescription(`╭━━━ 📋 **DETTAGLI**\n┣ 👤 **Utente:** ${interaction.user}\n┣ 📌 **Canale:** \`#${interaction.channel.name}\`\n┗ ⭐ **Valutazione:** \`${ratingType}\``)
            .setColor(0xFFD700).setTimestamp();
        await sendSystemLog(interaction.guild, ratingLogEmbed);

        const content = `⭐ **Grazie!** La tua valutazione (\`${ratingType}\`) è stata registrata.`;
        if (interaction.deferred || interaction.replied) return interaction.editReply({ content });
        return interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
};
