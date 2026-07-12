const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
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
                    description: "Candidature staff",
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
                "Seleziona la categoria del tuo ticket dal menu."
            )
            .setTimestamp();


        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    },


    async categoryHandler(interaction) {

        await interaction.deferReply({
            ephemeral: true
        });


        const type = interaction.values[0];


        const names = {
            partner: "supporto-partner",
            staff: "bando-staff",
            bug: "segnalazione-bug",
            idea: "idee-suggerimenti"
        };


        const channel = await interaction.guild.channels.create({

            name: `🎫・${names[type]}-${interaction.user.username}`,

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


        await channel.send({

            content: `<@${interaction.user.id}>`,

            embeds: [
                new EmbedBuilder()
                    .setTitle("🎫 Ticket Aperto")
                    .setDescription(
                        "Lo Staff risponderà appena possibile."
                    )
                    .setTimestamp()
            ]

        });


        const logs = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);


        if (logs) {

            logs.send(
                `🎫 **Ticket Creato**\n👤 Utente: ${interaction.user}\n📌 Canale: ${channel}`
            );

        }


        await interaction.editReply({
            content: `✅ Ticket creato: ${channel}`
        });

    }

};
