const { 
    SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, 
    ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits,
    ModalBuilder, TextInputBuilder, TextInputStyle 
} = require("discord.js");

const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_CATEGORY_ID = "1528582447443345560";
const TICKET_STAFF_ROLES = ["1528576030783176835"];
const EMBED_BLACK = "#2b2d31";

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("Apri un ticket di assistenza"),

    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🎫 Seleziona categoria di assistenza")
            .addOptions([
                { label: "Supporto Partner", value: "partner", emoji: "🤝" },
                { label: "Bando Staff", value: "staff", emoji: "🛡️" },
                { label: "Segnalazione Bug", value: "bug", emoji: "🐞" },
                { label: "Idee / Suggerimenti", value: "idea", emoji: "💡" }
            ]);

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(EMBED_BLACK)
                .setTitle("🎫 ELEGANCE - CENTRO SUPPORTO")
                .setDescription("Seleziona una categoria qui sotto per aprire un ticket. Uno staffer ti risponderà il prima possibile.")],
            components: [new ActionRowBuilder().addComponents(menu)],
            ephemeral: true
        });
    },

    async categoryHandler(interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (ticketSystem.hasOpenTicket(interaction.user.id)) return interaction.editReply({ content: "❌ Hai già un ticket aperto." });

        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `🎫﹒${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                ...TICKET_STAFF_ROLES.map(r => ({ id: r, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }))
            ]
        });

        ticketSystem.createTicket(interaction.user.id, { owner: interaction.user.id, channelId: channel.id, type: type, step: 0 });

        const embed = new EmbedBuilder()
            .setColor(EMBED_BLACK)
            .setTitle(`🎫 Ticket Aperto: ${type.toUpperCase()}`)
            .setDescription(`Benvenuto ${interaction.user}, lo staff è stato avvisato.\n\nRispondi alle domande dell'assistente IA per aiutarci a capire meglio la tua richiesta.\n\n**Stato:** 🟢 Attesa risposta utente`)
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setStyle(ButtonStyle.Success).setEmoji("✅"),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("Chiudi").setStyle(ButtonStyle.Danger).setEmoji("🔒")
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("add_user").setLabel("Aggiungi").setStyle(ButtonStyle.Secondary).setEmoji("➕"),
            new ButtonBuilder().setCustomId("remove_user").setLabel("Rimuovi").setStyle(ButtonStyle.Secondary).setEmoji("➖")
        );

        await channel.send({ content: `🔔 <@&${TICKET_STAFF_ROLES[0]}>`, embeds: [embed], components: [row1, row2] });
        
        // Log di apertura
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) logChannel.send({ embeds: [new EmbedBuilder().setColor("#00ff00").setTitle("📂 Nuovo Ticket").setDescription(`Creato da ${interaction.user} in ${channel}`)] });

        await interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
    },

    async buttonHandler(interaction) {
        const id = interaction.customId;
        const ticketData = ticketSystem.getAllTickets().find(t => t.channelId === interaction.channel.id);

        if (id === "add_user" || id === "remove_user") {
            const modal = new ModalBuilder().setCustomId(`modal_${id}`).setTitle("Gestione Utente");
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("user_id").setLabel("ID dell'utente").setStyle(TextInputStyle.Short).setRequired(true)
            ));
            return await interaction.showModal(modal);
        }

        if (id === "claim_ticket") {
            if (!TICKET_STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) return interaction.reply({ content: "❌ Solo staff.", ephemeral: true });
            await interaction.reply(`✅ Ticket preso in carico da ${interaction.user}`);
            await interaction.channel.setName(`✅﹒${interaction.channel.name.replace("🎫", "✅")}`);
        }

        if (id === "close_ticket") {
            if (interaction.user.id !== ticketData.owner && !TICKET_STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) return interaction.reply({ content: "❌ No.", ephemeral: true });
            await interaction.reply("🔒 Chiusura in corso...");
            const file = await transcriptManager.createTranscript(interaction.channel);
            await interaction.guild.members.cache.get(ticketData.owner)?.send({ content: "Ecco il transcript del tuo ticket:", files: [file] }).catch(() => {});
            
            const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (log) log.send(`📁 Transcript salvato per il ticket di <@${ticketData.owner}>`);
            
            ticketSystem.deleteTicket(ticketData.owner);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    },

    async router(interaction) { 
        interaction.customId = interaction.values[0]; 
        return this.buttonHandler(interaction); 
    }
};
