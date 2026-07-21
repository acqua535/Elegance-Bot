const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');

const DATA_PATH = './ticketsData.json';
const STAFF_ROLE_ID = "1528576030783176835";
const CATEGORY_ID = "1528582447443345560";
const ALLOWED_CHANNEL_ID = "1528576161959907348"; // L'unico canale in cui si può fare /ticket

const getData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '{}');
const saveData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Invia il pannello per aprire un ticket di assistenza'),

    async execute(interaction) {
        // Blocco: Se il comando non viene eseguito nel canale autorizzato, sparisce nel silenzio assoluto
        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            return interaction.reply({ content: "❌ Non puoi usare questo comando qui.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("🎟️ Assistenza Ticket")
            .setDescription("Seleziona una categoria dal menu a tendina qui sotto per aprire un ticket con lo staff.")
            .setColor(0x2f3136);

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('Seleziona il motivo...')
                .addOptions([
                    new StringSelectMenuOptionBuilder().setLabel('Supporto Generale').setValue('supporto').setEmoji('🛠️'),
                    new StringSelectMenuOptionBuilder().setLabel('Acquisti / Sponsor').setValue('sponsor').setEmoji('🛒'),
                    new StringSelectMenuOptionBuilder().setLabel('Segnalazioni').setValue('report').setEmoji('🚨')
                ])
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },

    async categoryHandler(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `︲🎫〞﹒${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ]
        });

        const data = getData();
        data[channel.id] = { owner: interaction.user.id, status: 'open', lastMessage: Date.now(), type };
        saveData(data);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("🛡️ Claim").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("ping_staff").setLabel("📢 Ping Staff").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("🔒 Chiudi").setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${interaction.user} <@&${STAFF_ROLE_ID}>`, components: [row] });
        return interaction.editReply({ content: `✅ Ticket creato con successo: ${channel}` });
    },

    async buttonHandler(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const id = interaction.customId;
        const data = getData();
        const ticket = data[interaction.channel.id];
        
        if (!ticket) return interaction.editReply({ content: "❌ Errore: Dati ticket non trovati." });

        if (id === 'ping_staff') {
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                return interaction.editReply({ content: "⏳ Ping staff disponibile solo ogni 24h." });
            }
            ticket.lastPing = Date.now();
            saveData(data);
            return interaction.editReply({ content: `📢 **${interaction.user.username}** ha richiesto l'intervento dello staff!` });
        }

        if (id === 'claim_ticket') {
            if (ticket.claimedBy) return interaction.editReply({ content: `⚠️ Ticket già preso da <@${ticket.claimedBy}>` });
            ticket.claimedBy = interaction.user.id;
            saveData(data);
            await interaction.channel.setName(`✅-${interaction.channel.name.replace('🎫-', '')}`).catch(() => {});
            return interaction.editReply({ content: `🛡️ Ticket preso in carico da ${interaction.user}.` });
        }

        if (id === 'close_ticket') {
            await interaction.editReply({ content: "🔒 Chiusura in corso, generazione transcript e salvataggio..." });

            try {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcript = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
                const buffer = Buffer.from(transcript, 'utf-8');
                
                const ownerUser = await interaction.guild.members.fetch(ticket.owner).catch(() => null);
                if (ownerUser) {
                    await ownerUser.send({
                        content: `📜 Transcript del tuo ticket (${ticket.type}) nel server ${interaction.guild.name}:`,
                        files: [{ attachment: buffer, name: `transcript-${interaction.channel.name}.txt` }]
                    }).catch(() => {});
                }
            } catch (err) {
                console.error("Errore generazione transcript:", err);
            }

            const ratingRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rate_good').setLabel('⭐ Ottimo').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('rate_mid').setLabel('⭐ Medio').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('rate_bad').setLabel('⭐ Scadente').setStyle(ButtonStyle.Danger)
            );

            await interaction.channel.send({
                content: `🔒 Il ticket sta per essere chiuso. Lascia una valutazione sullo staff:`,
                components: [ratingRow]
            }).catch(() => {});

            ticket.status = 'closed';
            saveData(data);

            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    },

    async ratingHandler(interaction) {
        await interaction.reply({ content: "⭐ Grazie mille per il tuo feedback!", ephemeral: true });
    },

    async handleMessage(message) {
        const data = getData();
        if (data[message.channel.id]) {
            data[message.channel.id].lastMessage = Date.now();
            saveData(data);
        }
    }
};
                                    
