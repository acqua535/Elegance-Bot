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
                "> *Benvenuto nel nostro portale dedicato. Seleziona il reparto idoneo dal menu per aprire una sessione privata con lo Staff.*\n\n" +
                "╭━━━ 📂 **DIPARTIMENTI ATTIVI**\n" +
                "┣ 💎 **` VIP & SERVIZI `** ── *Info, acquisti e supporto dedicato*\n" +
                "┣ 🤝 **` PARTNERSHIP `** ── *Proposte di sponsor e collaborazioni*\n" +
                "┣ 🐛 **` BUG & TECNICA `** ── *Segnalazione errori e problemi bot*\n" +
                "┗ 🚨 **` SEGNALAZIONI `** ── *Report riservati utenti o server*\n\n" +
                "╭━━━ 📋 **LINEE GUIDA OBBIGATORIE**\n" +
                "┣ ► Compila il **modulo pop-up** con dettagli chiari.\n" +
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

    async categoryHandler(interaction) {
        const type = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`ticket_modal_${type}`)
            .setTitle(`📌 MODULO: ${type.toUpperCase()}`);

        let questionLabel = "";
        let placeholderText = "";

        if (type === 'servizi') {
            questionLabel = "Di quale supporto o pacchetto VIP hai bisogno?";
            placeholderText = "Specifica la tua richiesta o l'assistenza desiderata...";
        } else if (type === 'partner') {
            questionLabel = "Descrizione del server / progetto:";
            placeholderText = "Inserisci link, numero membri e dettagli della collaborazione...";
        } else if (type === 'bug') {
            questionLabel = "Descrivi il bug o il problema riscontrato:";
            placeholderText = "Spiega in dettaglio cosa è successo e come si verifica...";
        } else if (type === 'report') {
            questionLabel = "Stai segnalando un utente o un server? Spiega:";
            placeholderText = "Inserisci Tag/ID e i dettagli della segnalazione...";
        }

        const input = new TextInputBuilder()
            .setCustomId('essential_answer')
            .setLabel(questionLabel)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000)
            .setPlaceholder(placeholderText);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },

        async modalHandler(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

        const type = interaction.customId.replace('ticket_modal_', '');
        const userAnswer = interaction.fields.getTextInputValue('essential_answer');
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
            claimedBy: null,
            initialReason: userAnswer
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
                `┗ 📌 **Canale:** ${channel} (\`#${channel.name}\`)\n\n` +
                "```fix\n" +
                `📝 MOTIVAZIONE:\n${userAnswer}\n` +
                "```"
            )
            .setColor(0x00FF99)
            .setTimestamp();
        await sendSystemLog(interaction.guild, openLogEmbed);

        // BENVENUTO NEL CANALE TICKET
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`✨ ✦ ASSISTENZA DEDICATA ✦ ✨`)
            .setDescription(
                `### 🎫 REPARTO: \`${type.toUpperCase()}\`\n` +
                `> *Ciao ${interaction.user}, la tua richiesta è stata registrata con successo. Un membro dello Staff prenderà in carico il ticket a breve.*\n\n` +
                "╭━━━ 📜 **INFORMATIVA & REGOLAMENTO**\n" +
                "┣ 🛑 **No Ping Inutili:** Non menzionare lo Staff senza un valido motivo.\n" +
                "┣ 📢 **Pulsante Notifica:** Usa il pulsante solo in caso di urgenza (max 1/24h).\n" +
                "┗ 🤝 **Linguaggio:** Mantieni sempre un tono idoneo ed educato.\n\n" +
                "╭━━━ 📝 **DATI RICHIESTA INIZIALE**\n" +
                `┗ ```\n${userAnswer}\n````
            )
            .addFields(
                { name: "👤 **Richiedente**", value: `${interaction.user}`, inline: true },
                { name: "📂 **Dipartimento**", value: `\`${type.toUpperCase()}\``, inline: true },
                { name: "🔒 **Stato Sessione**", value: "`Aperto & Attivo`", inline: true }
            )
            .setColor(0x2b2d31)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "Elegance Sponsoring • Support Control Center", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("🛡️ Prendi in Carico").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("ping_staff").setLabel("📢 Sollecita Staff").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("🔒 Chiudi Ticket").setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, embeds: [welcomeEmbed], components: [row] });

        return interaction.editReply({ content: `✅ **Ticket creato con successo!** Accedi al canale: ${channel}` });
    },

    async buttonHandler(interaction) {
        const id = interaction.customId;
        const data = getData();
        const ticket = data[interaction.channel.id];
        
        if (!ticket) {
            const errText = "❌ **Errore:** Impossibile recuperare i dati del ticket.";
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: errText });
            return interaction.reply({ content: errText, flags: MessageFlags.Ephemeral });
        }

        // --- SOLLECITA STAFF ---
        if (id === 'ping_staff') {
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                const msg = "⏳ **Cooldown Attivo:** Puoi sollecitare lo Staff soltanto una volta ogni 24 ore.";
                if (interaction.deferred || interaction.replied) return interaction.editReply({ content: msg });
                return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
            }
            ticket.lastPing = Date.now();
            saveData(data);
            
            await interaction.channel.send({ 
                content: `📢 <@&${STAFF_ROLE_ID}> • L'utente **${interaction.user.username}** ha richiesto una notifica prioritaria per questo ticket!` 
            });

            const pingLogEmbed = new EmbedBuilder()
                .setTitle("📢 ✦ SOLLECITO NOTIFICA STAFF ✦")
                .setDescription(
                    `╭━━━ 📋 **DETTAGLI**\n` +
                    `┣ 👤 **Utente:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
                    `┗ 📌 **Canale:** ${interaction.channel}\n`
                )
                .setColor(0xFFA500)
                .setTimestamp();
            await sendSystemLog(interaction.guild, pingLogEmbed);

            const okMsg = "📢 **Notifica inviata con successo allo Staff!**";
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: okMsg });
            return interaction.reply({ content: okMsg, flags: MessageFlags.Ephemeral });
        }

        // --- CLAIM TICKET ---
        if (id === 'claim_ticket') {
            if (ticket.claimedBy) {
                const msg = `⚠️ **Attenzione:** Ticket già preso in carico da <@${ticket.claimedBy}>.`;
                if (interaction.deferred || interaction.replied) return interaction.editReply({ content: msg });
                return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
            }
            ticket.claimedBy = interaction.user.id;
            saveData(data);

            const claimEmbed = new EmbedBuilder()
                .setDescription(`🛡️ **Ticket Preso in Carico:** Da questo momento l'assistenza è gestita da ${interaction.user}.`)
                .setColor(0x0099FF);
            
            await interaction.channel.send({ embeds: [claimEmbed] });

            const claimLogEmbed = new EmbedBuilder()
                .setTitle("🛡️ ✦ TICKET PRESO IN CARICO ✦")
                .setDescription(
                    `╭━━━ 📋 **DETTAGLI**\n` +
                    `┣ 👤 **Staffer:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
                    `┗ 📌 **Canale:** \`#${interaction.channel.name}\`\n`
                )
                .setColor(0x0099FF)
                .setTimestamp();
            await sendSystemLog(interaction.guild, claimLogEmbed);

            const msg = `✅ **Hai preso in carico il ticket con successo.**`;
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: msg });
            return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
        }

        // --- CHIUSURA TICKET ---
        if (id === 'close_ticket') {
            const startMsg = "🔒 **Chiusura avviata:** Generazione transcript e archiviazione...";
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
                    const dmEmbed = new EmbedBuilder()
                        .setTitle("📜 ✦ REPORT TRASCRIZIONE TICKET ✦")
                        .setDescription(
                            `Il tuo ticket nel server **${interaction.guild.name}** è stato chiuso.\n` +
                            `In allegato trovi la trascrizione completa della conversazione.`
                        )
                        .setColor(0x2b2d31)
                        .setTimestamp();

                    await ownerUser.send({
                        embeds: [dmEmbed],
                        files: [{ attachment: transcriptBuffer, name: transcriptFileName }]
                    }).catch(() => {});
                }
            } catch (err) {
                console.error("[ERROR_TRANSCRIPT]", err);
            }

            const closeLogEmbed = new EmbedBuilder()
                .setTitle("🔒 ✦ TICKET CHIUSO ✦")
                .setDescription(
                    `╭━━━ 📋 **DETTAGLI CHIUSURA**\n` +
                    `┣ 📂 **Categoria:** \`${ticket.type.toUpperCase()}\`\n` +
                    `┣ 👤 **Richiedente:** <@${ticket.owner}>\n` +
                    `┗ 🛡️ **Chiuso Da:** ${interaction.user} (\`${interaction.user.tag}\`)\n`
                )
                .setColor(0xFF0000)
                .setTimestamp();

            const logFiles = transcriptBuffer ? [{ attachment: transcriptBuffer, name: transcriptFileName }] : [];
            await sendSystemLog(interaction.guild, closeLogEmbed, logFiles);

            const ratingEmbed = new EmbedBuilder()
                .setTitle("⭐ ✦ VALUTAZIONE SUPPORTO ✦")
                .setDescription(
                    "### Come valuti l'assistenza ricevuta?\n" +
                    "> *Clicca su uno dei pulsanti sottostanti per esprimere un giudizio sul servizio offerto dallo Staff.*"
                )
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
            .setTitle("⭐ ✦ NUOVA VALUTAZIONE ✦")
            .setDescription(
                `╭━━━ 📋 **DETTAGLI FEEDBACK**\n` +
                `┣ 👤 **Utente:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
                `┣ 📌 **Canale:** \`#${interaction.channel.name}\`\n` +
                `┗ ⭐ **Valutazione:** \`${ratingType}\`\n`
            )
            .setColor(0xFFD700)
            .setTimestamp();
        await sendSystemLog(interaction.guild, ratingLogEmbed);

        const content = `⭐ **Grazie mille!** La tua valutazione (\`${ratingType}\`) è stata registrata con successo.`;
        if (interaction.deferred || interaction.replied) return interaction.editReply({ content });
        return interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
};
