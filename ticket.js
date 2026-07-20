const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const DATA_PATH = './ticketsData.json';
const STAFF_ROLE_ID = "1528576030783176835";
const CATEGORY_ID = "1528582447443345560";

const getData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '{}');
const saveData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("🎫 Apri un ticket"),

    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🎫 Seleziona categoria...")
            .addOptions([
                { label: "Partner", value: "partner", emoji: "🤝" },
                { label: "Staff", value: "staff", emoji: "🛡️" },
                { label: "Bug", value: "bug", emoji: "🐞" },
                { label: "Report", value: "report", emoji: "🚫" }
            ]);
        await interaction.reply({ embeds: [new EmbedBuilder().setTitle("Supporto Elegance").setDescription("Seleziona:")], components: [new ActionRowBuilder().addComponents(menu)] });
    },

    async categoryHandler(interaction) {
        await interaction.deferUpdate(); // Evita il crash
        const channel = await interaction.guild.channels.create({
            name: `🎫-${interaction.values[0]}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const data = getData();
        data[channel.id] = { owner: interaction.user.id, status: 'open', lastMessage: Date.now(), type: interaction.values[0] };
        saveData(data);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ping_staff").setLabel("📢 Ping Staff").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("🔒 Chiudi").setStyle(ButtonStyle.Danger)
        );
        await channel.send({ content: `${interaction.user} <@&${STAFF_ROLE_ID}>`, components: [row] });
    },

    async buttonHandler(interaction) {
        if (interaction.customId === 'ping_staff') {
            const data = getData();
            const ticket = data[interaction.channel.id];
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                return interaction.reply({ content: "⏳ Aspetta 24h per pingare.", ephemeral: true });
            }
            ticket.lastPing = Date.now();
            saveData(data);
            await interaction.reply({ content: `<@&${STAFF_ROLE_ID}>` });
        } else if (interaction.customId === 'close_ticket') {
            await interaction.reply("🔒 Chiusura...");
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    },

    async handleMessage(message) {
        const data = getData();
        if (data[message.channel.id]) {
            data[message.channel.id].lastMessage = Date.now();
            saveData(data);
        }
    }
};
                
