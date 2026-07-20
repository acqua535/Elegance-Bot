const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

// =====================================
// CONFIG AGGIORNATO (Elegance Sponsoring)
// =====================================
const LOG_CHANNEL_ID = "1528576197741772902";           // Canale Log Privato
const TICKET_CATEGORY_ID = "1528582447443345560";       // Categoria Ticket Aperti
const COMANDI_BOT_ID = "1528576171329982635";           // Canale Comandi Bot (per achievement/minigame)
const RECENSIONI_CHANNEL_ID = "1528576169048281169";    // Canale Recensioni Pubbliche

const TICKET_STAFF_ROLES = [
    "1528576030783176835"
];

// Colore Total Black definitivo (Discord Dark Mode Fusion)
const EMBED_BLACK = "#2b2d31";

// =====================================
// STAFF CHECK
// =====================================
function isStaff(member) {
    if (!member) return false;
    return TICKET_STAFF_ROLES.some(id => member.roles.cache.has(id));
}

module.exports = {

    // =====================================
    // COMMAND DATA
    // =====================================
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Apri un ticket di supporto"),

    // =====================================
    // PANEL
    // =====================================
    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🎫 Seleziona categoria ticket")
            .addOptions([
                { label: "Supporto Partner", description: "Partnership e collaborazioni", value: "partner", emoji: "🤝" },
                { label: "Bando Staff", description: "Candidatura staff", value: "staff", emoji: "🛡️" },
                { label: "Segnalazione Bug", description: "Segnala un problema", value: "bug", emoji: "🐞" },
                { label: "Idee / Suggerimenti", description: "Invia una proposta", value: "idea", emoji: "💡" }
            ]);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(EMBED_BLACK)
                    .setTitle("🎫 CENTRO SUPPORTO • APERTURA TICKET")
                    .setDescription(
                        "Benvenuto nel sistema di supporto ufficiale del server.\n\n" +
                        "Se hai bisogno di assistenza, riscontri problemi o desideri fare una richiesta ufficiale alla Amministrazione, seleziona la categoria corretta dal menu qui sotto.\n\n" +
                        "**⚠️ Linee Guida importanti:**\n" +
                        "• Lo spam o l'apertura di ticket inutili/esca porterà a sanzioni immediate.\n" +
                        "• Il ticket è strettamente riservato tra te e i Responsabili Veri."
                    )
            ],
            components: [new ActionRowBuilder().addComponents(menu)]
        });
    },

    // =====================================
    // CREATE TICKET
    // =====================================
    async categoryHandler(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (ticketSystem.hasOpenTicket(interaction.user.id)) {
            return interaction.editReply({ content: "❌ Hai già un ticket aperto." });
        }

        const type = interaction.values[0];
        const names = {
            partner: "partner",
            staff: "bando-staff",
            bug: "bug",
            idea: "suggerimento"
        };

        // Creazione canale nella nuova categoria aperti: 1528582447443345560
        const channel = await interaction.guild.channels.create({
            name: `🎫┃${names[type]}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.EmbedLinks] },
                ...TICKET_STAFF_ROLES.map(role => ({
                    id: role,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                }))
            ]
        });

        ticketSystem.createTicket(interaction.user.id, {
            owner: interaction.user.id,
            channelId: channel.id,
            type: type,
            claimedBy: null,
            createdAt: Date.now()
        });

        const manageMenu = new StringSelectMenuBuilder()
            .setCustomId("ticket_manage")
            .setPlaceholder("⚙️ Gestione Ticket")
            .addOptions([
                { label: "Reclama Ticket", description: "Prendi in carico il ticket", value: "claim_ticket", emoji: "🙋" },
                { label: "Informazioni Ticket", description: "Visualizza informazioni", value: "ticket_info", emoji: "📋" },
                { label: "Chiudi Ticket", description: "Chiudi il ticket", value: "close_ticket", emoji: "🔒" }
            ]);

        const staffPings = TICKET_STAFF_ROLES.map(roleId => `<@&${roleId}>`).join(" ");

        await channel.send({
            content: `🔔 **NOTIFICA RESPONSABILI:** ${staffPings}\n<@${interaction.user.id}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(EMBED_BLACK)
                    .setTitle("📂 TICKET APERTO • ASSISTENZA DIRETTA")
                    .setDescription(
                        `Benvenuto <@${interaction.user.id}>, il tuo canale di supporto privato è stato avviato.\n\n` +
                        `**📂 Categoria selezionata:** \`${type.toUpperCase()}\`\n\n` +
                        "I **Responsabili Veri** del server sono stati notificati e prenderanno in carico la tua richiesta nel minor tempo possibile.\n\n" +
                        "**📝 Cosa fare adesso:**\n" +
                        "1. Descrivi dettagliatamente il motivo della tua apertura in un unico messaggio.\n" +
                        "2. Se necessario, allega subito screen o prove video per velocizzare i tempi.\n" +
                        "3. Attendi con pazienza senza effettuare ping inutili."
                    )
            ],
            components: [new ActionRowBuilder().addComponents(manageMenu)]
        });

        // Log nel canale privato: 1528576197741772902
        const logs = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logs) {
            await logs.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(EMBED_BLACK)
                        .setTitle("⚠️ LOG PRIVATO • TICKET CREATO")
                        .setDescription(
                            `• **Utente:** ${interaction.user}\n` +
                            `• **Canale:** ${channel}\n` +
                            `• **Categoria:** \`${type}\`\n\n` +
                            "Accesso riservato ai soli responsabili."
                        )
                ]
            });
        }

        await interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
    },

    // =====================================
    // ROUTER MENU
    // =====================================
    async router(interaction) {
        try {
            const option = interaction.values[0];

            if (option === "claim_ticket") {
                interaction.customId = "claim_ticket";
                return module.exports.buttonHandler(interaction);
            }

            if (option === "close_ticket") {
                interaction.customId = "close_ticket";
                return module.exports.buttonHandler(interaction);
            }

            if (option === "ticket_info") {
                const data = ticketSystem.getTicket(interaction.user.id);
                if (!data) {
                    return interaction.reply({ content: "❌ Ticket non trovato.", ephemeral: true });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(EMBED_BLACK)
                            .setTitle("📋 INFORMAZIONI INTERNE TICKET")
                            .setDescription(
                                `• **Proprietario:** <@${data.owner}>\n` +
                                `• **Categoria:** \`${data.type}\`\n` +
                                `• **Staff Assegnato:** ${data.claimedBy ? `<@${data.claimedBy}>` : "`Nessuno`"}`
                            )
                    ],
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error("❌ Errore router ticket:", error);
        }
    },

    // =====================================
    // BUTTON HANDLER (Chiusura, Log e Trigger Recensione)
    // =====================================
    async buttonHandler(interaction) {
        try {
            const ticketData = ticketSystem.getTicket(interaction.user.id);
            if (!ticketData) {
                return interaction.reply({ content: "❌ Ticket non trovato nel sistema.", ephemeral: true });
            }

            const logs = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

            if (interaction.customId === "claim_ticket") {
                if (!isStaff(interaction.member)) {
                    return interaction.reply({ content: "❌ Solo lo Staff può reclamare i ticket.", ephemeral: true });
                }

                if (ticketData.claimedBy) {
                    return interaction.reply({ content: `❌ Ticket già reclamato da <@${ticketData.claimedBy}>.`, ephemeral: true });
                }

                ticketData.claimedBy = interaction.user.id;
                ticketSystem.updateTicket(ticketData.owner, ticketData);

                await interaction.reply({ content: `🙋 Ticket reclamato da ${interaction.user}.` });

                if (logs) {
                    await logs.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(EMBED_BLACK)
                                .setTitle("⚠️ LOG PRIVATO • TICKET RECLAMATO")
                                .setDescription(
                                    `• **Staffer:** ${interaction.user}\n` +
                                    `• **Ticket:** ${interaction.channel}\n` +
                                    `• **Target:** <@${ticketData.owner}>`
                                )
                        ]
                    });
                }
                return;
            }

            if (interaction.customId === "close_ticket") {
                const allowed = interaction.user.id === ticketData.owner || isStaff(interaction.member);
                if (!allowed) {
                    return interaction.reply({ content: "❌ Non hai l'autorizzazione per chiudere questo ticket.", ephemeral: true });
                }

                await interaction.reply({ content: "🔒 Archiviazione e chiusura ticket in corso...", ephemeral: true });

                let transcriptFile;
                try {
                    transcriptFile = await transcriptManager.createTranscript(interaction.channel);
                } catch (error) {
                    console.error("Transcript error:", error);
                    return interaction.followUp({ content: "❌ Errore critico durante la creazione del transcript.", ephemeral: true });
                }

                const targetUser = await interaction.guild.members.fetch(ticketData.owner).catch(() => null);
                if (targetUser) {
                    try {
                        const recensioneRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId("apri_recensione")
                                .setLabel("⭐ Lascia una Valutazione")
                                .setStyle(ButtonStyle.Secondary)
                        );

                        await targetUser.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(EMBED_BLACK)
                                    .setTitle("🔒 TICKET CHIUSO • RESOCONTO SUPPORTO")
                                    .setDescription(
                                        "Il tuo ticket all'interno del server è stato chiuso definitivamente.\n\n" +
                                        "In allegato trovi il **Transcript ufficiale in formato HTML** con la cronologia della chat.\n\n" +
                                        "**Ci aiuti a migliorare?**\n" +
                                        "Clicca sul bottone qui sotto per lasciare la tua valutazione anonima o firmata."
                                    )
                            ],
                            files: [transcriptFile],
                            components: [recensioneRow]
                        });
                    } catch (dmError) {
                        console.log(`Impossibile inviare il DM a ${targetUser.user.tag}.`);
                    }
                }

                if (logs) {
                    await logs.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(EMBED_BLACK)
                                .setTitle("⚠️ LOG PRIVATO • TICKET CHIUSO")
                                .setDescription(
                                    `• **Chiuso da:** ${interaction.user}\n` +
                                    `• **Proprietario:** <@${ticketData.owner}>\n` +
                                    `• **Categoria:** \`${ticketData.type}\`\n\n` +
                                    "Il transcript in HTML è allegato qui sotto."
                                )
                        ],
                        files: [transcriptFile]
                    });
                }

                ticketSystem.deleteTicket(ticketData.owner);

                setTimeout(() => {
                    interaction.channel.delete().catch(() => {});
                }, 3000);

                return;
            }
        } catch (error) {
            console.error("❌ Errore globale bottoni:", error);
        }
    }
};
