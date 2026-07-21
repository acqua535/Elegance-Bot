const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');

const DATA_PATH = './ticketsData.json';
const STAFF_ROLE_ID = "1528576030783176835";
const CATEGORY_ID = "1528582447443345560";
const ALLOWED_CHANNEL_ID = "1528576161959907348";

const getData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '{}');
const saveData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));

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
                "Benvenuto nel sistema ufficiale di supporto di **Elegance Sponsoring**.\n\n" +
                "Il nostro team di esperti è pronto a fornirti assistenza dedicata per qualsiasi esigenza. Seleziona attentamente la categoria di tuo interesse dal menu interattivo sottostante per aprire un canale riservato.\n\n" +
                "⚠️ *Ti invitiamo ad aprire un ticket solo se strettamente necessario per evitare sanzioni.*"
            )
            .addFields(
                { name: "💎 Servizi & VIP", value: "Assistenza dedicata sui servizi offerti e gestione privilegi.", inline: false },
                { name: "🤝 Partnership & Sponsor", value: "Gestione collaborazioni, accordi commerciali e sponsorizzazioni.", inline: false },
                { name: "🐛 Bug & Errori", value: "Segnalazione di malfunzionamenti, bug tecnici o problemi di sistema.", inline: false },
                { name: "🚨 Segnalazioni", value: "Report su utenti, comportamenti scorretti o violazioni del regolamento.", inline: false }
            )
            .setColor(0x2f3136)
            .setFooter({ text: "Elegance Sponsoring • Secure Ticket System", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('📂 Seleziona il dipartimento di supporto...')
                .addOptions([
                    new StringSelectMenuOptionBuilder().setLabel('Servizi & VIP').setValue('servizi').setDescription('Assistenza dedicata sui servizi offerti').setEmoji('💎'),
                    new StringSelectMenuOptionBuilder().setLabel('Partnership & Sponsor').setValue('partner').setDescription('Gestione collaborazioni e accordi commerciali').setEmoji('🤝'),
                    new StringSelectMenuOptionBuilder().setLabel('Bug & Errori').setValue('bug').setDescription('Segnala malfunzionamenti o problemi tecnici').setEmoji('🐛'),
                    new StringSelectMenuOptionBuilder().setLabel('Segnalazioni').setValue('report').setDescription('Segnala infrazioni o problemi gravi').setEmoji('🚨')
                ])
        );

        await interaction.reply({ embeds: [embed], components: [row] });
        console.log(`[TICKET_PANEL] Pannello di assistenza distribuito con successo nel canale ${interaction.channel.name} (${interaction.channelId}) da ${interaction.user.tag}`);
    },

    async categoryHandler(interaction) {
        const type = interaction.values[0];
        const channelName = `︲🎫〞﹒${type}-${interaction.user.username}`;
        
        console.log(`[TICKET_INIT] Richiesta apertura ticket [Categoria: ${type.toUpperCase()}] da parte dell'utente ${interaction.user.tag} (${interaction.user.id})`);

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
        data[channel.id] = { owner: interaction.user.id, status: 'open', lastMessage: Date.now(), type, claimedBy: null };
        saveData(data);

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`🎫 TICKET APERTO ── [${type.toUpperCase()}]`)
            .setDescription(
                `Gentile ${interaction.user}, grazie per aver aperto un ticket.\n\n` +
                "Il nostro team di supporto è stato allertato e prenderà in carico la tua richiesta nel minor tempo possibile.\n\n" +
                "📌 **Regole del canale:**\n" +
                "• Descrivi dettagliatamente il tuo problema.\n" +
                "• Evita di pingare inutilmente lo staff.\n" +
                "• Mantieni un linguaggio consono e rispettoso."
            )
            .setColor(0x00FF99)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("🛡️ Prendi in Carico").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("ping_staff").setLabel("📢 Notifica Staff").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("🔒 Chiudi Ticket").setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, embeds: [welcomeEmbed], components: [row] });
        console.log(`[TICKET_CREATED] Canale di supporto generato con successo: #${channel.name} (${channel.id})`);

        return interaction.followUp({ content: `✅ **Ticket creato con successo!** Clicca qui per accedere: ${channel}`, flags: MessageFlags.Ephemeral });
    },

    async buttonHandler(interaction) {
        const id = interaction.customId;
        const data = getData();
        const ticket = data[interaction.channel.id];
        
        if (!ticket) {
            console.warn(`[WARNING] Tentativo di interazione su un canale non registrato come ticket: ${interaction.channel.id}`);
            return interaction.editReply({ content: "❌ **Errore Critico:** Impossibile trovare i metadati associati a questo ticket nei registri di sistema." });
        }

        if (id === 'ping_staff') {
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                return interaction.editReply({ content: "⏳ **Coaktif Attivo:** È possibile sollecitare l'intervento dello staff solo una volta ogni 24 ore." });
            }
            ticket.lastPing = Date.now();
            saveData(data);
            
            console.log(`[TICKET_ACTION] L'utente ${interaction.user.tag} ha sollecitato l'intervento dello staff nel ticket #${interaction.channel.name}`);
            
            await interaction.channel.send({ 
                content: `📢 <@&${STAFF_ROLE_ID}> • L'utente **${interaction.user.username}** richiede l'intervento immediato dello staff in questo canale!` 
            });
            return interaction.editReply({ content: "✅ Sollecito inviato con successo allo staff!" });
        }

        if (id === 'claim_ticket') {
            if (ticket.claimedBy) {
                return interaction.editReply({ content: `⚠️ **Attenzione:** Questo ticket è già stato preso in carico da <@${ticket.claimedBy}>.` });
            }
            ticket.claimedBy = interaction.user.id;
            saveData(data);
            
            console.log(`[TICKET_CLAIMED] Il membro dello staff ${interaction.user.tag} (${interaction.user.id}) ha preso in carico il ticket #${interaction.channel.name}`);
            return interaction.editReply({ content: `🛡️ **Ticket Preso in Carico:** Il presente canale di assistenza è ora gestito ufficialmente da ${interaction.user}.` });
        }

        if (id === 'close_ticket') {
            await interaction.editReply({ content: "🔒 **Procedura di chiusura avviata:** Estrazione log chat e generazione report in corso..." });
            console.log(`[TICKET_CLOSE] Avvio procedura di chiusura per il ticket #${interaction.channel.name} (${interaction.channel.id}) richiesto da ${interaction.user.tag}`);

            try {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcript = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
                const buffer = Buffer.from(transcript, 'utf-8');
                
                const ownerUser = await interaction.guild.members.fetch(ticket.owner).catch(() => null);
                if (ownerUser) {
                    await ownerUser.send({
                        content: `📜 **Report di Trascrizione Ufficiale**\nIl tuo ticket **[${ticket.type.toUpperCase()}]** nel server **${interaction.guild.name}** è stato chiuso. In allegato trovi lo storico dei messaggi.`,
                        files: [{ attachment: buffer, name: `transcript-${interaction.channel.name}.txt` }]
                    }).catch(() => {
                        console.log(`[TICKET_TRANSCRIPT] Impossibile inviare il transcript in DM all'utente ${ticket.owner} (probabilmente ha i DM chiusi).`);
                    });
                }
            } catch (err) {
                console.error("[ERROR_TRANSCRIPT] Errore critico nella generazione del transcript:", err);
            }

            const ratingEmbed = new EmbedBuilder()
                .setTitle("⭐ VALUTAZIONE DEL SUPPORTO")
                .setDescription("Il ticket è stato chiuso con successo. Per aiutarci a migliorare la qualità dei nostri servizi, ti invitiamo a valutare l'assistenza ricevuta cliccando su uno dei pulsanti sottostanti:")
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

            console.log(`[TICKET_DELETED] Il canale #${interaction.channel.name} verrà eliminato permanentemente tra 5 secondi.`);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    },

    async ratingHandler(interaction) {
        const ratingType = interaction.customId.replace('rate_', '');
        console.log(`[TICKET_RATING] L'utente ${interaction.user.tag} ha espresso una valutazione di tipo: [${ratingType.toUpperCase()}] nel canale #${interaction.channel.name}`);
        return interaction.editReply({ content: `⭐ **Feedback Registrato con Successo!** La ringraziamo per aver valutato il supporto di Elegance Sponsoring.` });
    },

    async handleMessage(message) {
        const data = getData();
        if (data[message.channel.id]) {
            data[message.channel.id].lastMessage = Date.now();
            saveData(data);
        }
    }
};
