const { 
    SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, 
    ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits 
} = require("discord.js");

const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_CATEGORY_ID = "1528582447443345560";
const TICKET_STAFF_ROLES = ["1528576030783176835"];
const EMBED_COLOR = "#2b2d31";
const PREFIX = "︲🎫〞﹒";

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("Apri un ticket di assistenza"),

    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🎫 Seleziona categoria assistenza")
            .addOptions([
                { label: "Supporto Partner", value: "partner", emoji: "🤝" },
                { label: "Bando Staff", value: "staff", emoji: "🛡️" },
                { label: "Segnalazione Bug", value: "bug", emoji: "🐞" },
                { label: "Idee / Suggerimenti", value: "idea", emoji: "💡" }
            ]);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🎫 ELEGANCE | CENTRO SUPPORTO")
            .setDescription("Siamo qui per aiutarti. Seleziona una categoria e il nostro team ti risponderà il prima possibile.")
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: "Elegance Community | Sistema Ticket" });

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)], ephemeral: false });
    },

    async categoryHandler(interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (ticketSystem.hasOpenTicket(interaction.user.id)) return interaction.editReply({ content: "❌ Hai già un ticket aperto." });

        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `${PREFIX}${type}-${interaction.user.username}`,
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
            .setColor(EMBED_COLOR)
            .setTitle(`${PREFIX}Ticket | ${type.toUpperCase()}`)
            .setDescription(`Benvenuto ${interaction.user}. Il ticket è stato creato. Puoi gestire le operazioni tramite il menu sottostante.`)
            .addFields(
                { name: "👤 Utente", value: `${interaction.user.tag}`, inline: true },
                { name: "📋 Categoria", value: `${type.toUpperCase()}`, inline: true },
                { name: "🤖 Stato IA", value: "Disattivato", inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL());

        const manageMenu = new StringSelectMenuBuilder()
            .setCustomId("ticket_manage")
            .setPlaceholder("⚙️ Pannello Gestione")
            .addOptions([
                { label: "Prendi in carico (Claim)", value: "claim_ticket", emoji: "✅" },
                { label: "Attiva Assistente IA", value: "enable_ai", emoji: "🤖" },
                { label: "Ping Staff (Countdown)", value: "ping_staff", emoji: "🔔" },
                { label: "Chiudi Ticket", value: "close_ticket", emoji: "🔒" }
            ]);

        await channel.send({ content: `🔔 <@&${TICKET_STAFF_ROLES[0]}>`, embeds: [embed], components: [new ActionRowBuilder().addComponents(manageMenu)] });
        
        await interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
    },

    async buttonHandler(interaction) {
        const id = interaction.customId;
        const ticketData = ticketSystem.getAllTickets().find(t => t.channelId === interaction.channel.id);
        if (!ticketData) return;

        // Gestione Ping Staff con Countdown
        if (id === "ping_staff") {
            let countdown = 5;
            const msg = await interaction.reply({ content: `🔔 Notifica staff in invio tra ${countdown} secondi...`, fetchReply: true });
            const interval = setInterval(async () => {
                countdown--;
                if (countdown > 0) {
                    await msg.edit(`🔔 Notifica staff in invio tra ${countdown} secondi...`);
                } else {
                    clearInterval(interval);
                    await msg.delete().catch(() => {});
                    await interaction.channel.send(`🔔 <@&${TICKET_STAFF_ROLES[0]}> **Attenzione!** Richiesta assistenza immediata in questo ticket.`);
                }
            }, 1000);
            return;
        }

        // Gestione Attivazione IA
        if (id === "enable_ai") {
            // Qui puoi integrare la logica per settare 'aiEnabled = true' nel tuo database dei ticket
            return interaction.reply({ content: "🤖 Assistente IA attivato per questo canale. Ora risponderò automaticamente alle domande.", ephemeral: false });
        }

        // Gestione Claim
        if (id === "claim_ticket") {
            if (!TICKET_STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) return interaction.reply({ content: "❌ Solo staff.", ephemeral: true });
            return interaction.reply({ content: `✅ Ticket preso in carico da ${interaction.user}` });
        }

        // Gestione Chiusura
        if (id === "close_ticket") {
            if (interaction.user.id !== ticketData.owner && !TICKET_STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) return interaction.reply({ content: "❌ No.", ephemeral: true });
            await interaction.reply("🔒 Chiusura in corso...");
            const file = await transcriptManager.createTranscript(interaction.channel);
            await interaction.guild.members.cache.get(ticketData.owner)?.send({ content: "Ecco il transcript del tuo ticket:", files: [file] }).catch(() => {});
            ticketSystem.deleteTicket(ticketData.owner);
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    },

    async router(interaction) { 
        interaction.customId = interaction.values[0]; 
        return this.buttonHandler(interaction); 
    }
};
    
