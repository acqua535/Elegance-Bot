const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const DATA_PATH = './ticketsData.json';
const STAFF_ROLE_ID = "1528576030783176835";
const CATEGORY_ID = "1528582447443345560";

const getData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '{}');
const saveData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("🎫 Apri un ticket di supporto rapido"),

    async execute(interaction) {
        // Rimosso ephemeral: true per renderlo visibile a tutti
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("🎫 CENTRO ASSISTENZA ELEGANCE")
            .setDescription("Benvenuto nel portale di supporto ufficiale.\n\nSeleziona una categoria dal menù sottostante per aprire una conversazione privata con il nostro staff.")
            .setFooter({ text: "Il sistema è attivo e pronto ad aiutarti.", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("👉 Seleziona l'area di interesse...")
            .addOptions([
                { label: "🤝 Supporto Partner", value: "partner", description: "Per richieste di partnership" },
                { label: "🛡️ Bando Staff", value: "staff", description: "Per candidarsi come moderatore" },
                { label: "🐞 Segnalazione Bug", value: "bug", description: "Per errori riscontrati" },
                { label: "🚫 Report Utente", value: "report", description: "Per segnalare comportamenti scorretti" }
            ]);

        await interaction.reply({ 
            embeds: [embed], 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });
    },

    async categoryHandler(interaction) {
        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `🎫-${type}-${interaction.user.username}`,
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

        const embed = new EmbedBuilder()
            .setColor(0x00FF9D)
            .setTitle(`Supporto: ${type.toUpperCase()}`)
            .setDescription(`Ciao ${interaction.user}, lo staff è stato informato della tua richiesta.\n\nPuoi usare i bottoni qui sotto per gestire questa conversazione.`)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ping_staff").setLabel("📢 Richiedi Staff").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("🔒 Chiudi Ticket").setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${interaction.user} <@&${STAFF_ROLE_ID}>`, embeds: [embed], components: [row] });
        await interaction.update({ content: `✅ Ticket creato con successo: ${channel}`, components: [], ephemeral: true });
    },

    async buttonHandler(interaction) {
        const data = getData();
        const ticket = data[interaction.channel.id];

        if (interaction.customId === 'ping_staff') {
            if (ticket.lastPing && (Date.now() - ticket.lastPing < 86400000)) {
                return interaction.reply({ content: "⏳ Il ping è limitato a una volta ogni 24 ore.", ephemeral: true });
            }
            ticket.lastPing = Date.now();
            saveData(data);
            await interaction.reply({ content: `📢 **${interaction.user.username}** ha richiesto l'intervento dello staff!` });
        }

        if (interaction.customId === 'close_ticket') {
            await interaction.reply("🔒 Il ticket verrà chiuso tra 5 secondi...");
            ticket.status = 'closed';
            saveData(data);
            setTimeout(() => interaction.channel.delete(), 5000);
        }
    }
};
