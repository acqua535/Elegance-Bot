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

const LOG_CHANNEL_ID = "1505261606483923105";
const TICKET_CATEGORY_ID = "1525919850764177408";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Apri un ticket di supporto"),

    async execute(interaction) {

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("Seleziona il tipo di richiesta")
            .addOptions([
                {
                    label: "Supporto Partner",
                    description: "Richieste partnership e collaborazioni",
                    value: "partner",
                    emoji: "🤝"
                },
                {
                    label: "Bando Staff",
                    description: "Candidature per entrare nello staff",
                    value: "staff",
                    emoji: "🛡️"
                },
                {
                    label: "Segnalazioni e/o Bug",
                    description: "Segnala problemi o bug",
                    value: "bug",
                    emoji: "🐞"
                },
                {
                    label: "Idee / Suggerimenti",
                    description: "Invia una proposta",
                    value: "idea",
                    emoji: "💡"
                }
            ]);

        const row = new ActionRowBuilder()
            .addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle("🎫 Elegance Support")
            .setDescription(
                "Seleziona dal menu la categoria del tuo ticket.\n\n" +
                "Lo Staff risponderà il prima possibile."
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};


// Gestione creazione ticket
module.exports.categoryHandler = async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket_category") return;

    const type = interaction.values[0];

    const categories = {
        partner: "🤝・supporto-partner",
        staff: "🛡️・bando-staff",
        bug: "🐞・segnalazioni-bug",
        idea: "💡・idee-suggerimenti"
    };


    const ticketChannel = await interaction.guild.channels.create({
        name: `${categories[type]}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID,

        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [
                    PermissionFlagsBits.ViewChannel
                ]
            },
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            }
        ]
    });


    const buttons = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("ticket_claim")
                .setLabel("🙋 Reclama")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_close")
                .setLabel("🔒 Chiudi")
                .setStyle(ButtonStyle.Danger)

        );


    await ticketChannel.send({

        content: `<@${interaction.user.id}>`,

        embeds: [
            new EmbedBuilder()
                .setTitle("🎫 Ticket Aperto")
                .setDescription(
                    `Categoria: **${categories[type]}**\n\n` +
                    "Attendi una risposta dallo Staff."
                )
                .setTimestamp()
        ],

        components: [buttons]
    });


    const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

    if (logChannel) {
        logChannel.send(
            `🎫 **Ticket Creato**\n` +
            `👤 Utente: ${interaction.user}\n` +
            `📁 Categoria: ${categories[type]}\n` +
            `📌 Canale: ${ticketChannel}`
        );
    }


    await interaction.reply({
        content: `✅ Ticket creato: ${ticketChannel}`,
        ephemeral: true
    });
};
