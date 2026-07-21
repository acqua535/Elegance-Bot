const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');

const DATA_PATH = './ticketsData.json';
const STAFF_ROLE_ID = "1528576030783176835";
const CATEGORY_ID = "1528582447443345560";

const getData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '{}');
const saveData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));

module.exports = {
    // 1. Fondamentale per il commandHandler.js
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Invia il pannello per aprire un ticket di assistenza'),

    // 2. Fondamentale per il commandHandler.js
    async execute(interaction) {
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

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    // Gestione Menu (chiamata dal Registry)
    async categoryHandler(interaction) {
        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `︲🎫〞﹒${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
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
        return interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
    },

    // Gestione Bottoni
    async buttonHandler(interaction) {
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
            await interaction.channel.setName(`✅-${interaction.channel.name.replace('🎫-', '')}`);
            return interaction.editReply({ content: `🛡️ Ticket preso in carico da ${interaction.user}.` });
        }

        if (id === 'close_ticket') {
            await interaction.editReply({ content: "🔒 Chiusura in corso..." });
            ticket.status = 'closed';
            saveData(data);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    },

    async ratingHandler(interaction) {
        const rating = interaction.customId.replace('rate_', '');
        return interaction.editReply({ content: `⭐ Grazie per il feedback (${rating.toUpperCase()})!` });
    },

    async handleMessage(message) {
        const data = getData();
        if (data[message.channel.id]) {
            data[message.channel.id].lastMessage = Date.now();
            saveData(data);
        }
    }
};
