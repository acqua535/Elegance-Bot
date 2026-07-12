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

const TICKET_STAFF_ROLES = [
    "1505192718068879430",
    "1505192964769714287"
];


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
            .setDescription("Seleziona la categoria del tuo ticket dal menu.")
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
                },


                ...TICKET_STAFF_ROLES.map(roleId => ({

                    id: roleId,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]

                }))

            ]

        });


        const buttons = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("claim_ticket")
                    .setLabel("🙋 Reclama")
                    .setStyle(ButtonStyle.Primary),


                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("🔒 Chiudi")
                    .setStyle(ButtonStyle.Danger)

            );


        await channel.send({

            content: `<@${interaction.user.id}>`,

            embeds: [
                new EmbedBuilder()
                    .setTitle("🎫 Ticket Aperto")
                    .setDescription(
                        "Lo Staff risponderà appena possibile.\n\nUsa i bottoni qui sotto per gestire il ticket."
                    )
                    .setTimestamp()
            ],

            components: [buttons]

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

    },


    async buttonHandler(interaction) {


        const logs = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);


        if (interaction.customId === "claim_ticket") {


            await interaction.reply({
                content: `🙋 Ticket reclamato da ${interaction.user}`,
                ephemeral: false
            });


            if (logs) {

                logs.send(
                    `🙋 **Ticket Reclamato**\n👤 Staff: ${interaction.user}\n📌 Canale: ${interaction.channel}`
                );

            }

        }



        if (interaction.customId === "close_ticket") {


            await interaction.reply({
                content: "🔒 Ticket chiuso.",
                ephemeral: false
            });


            if (logs) {

                logs.send(
                    `🔒 **Ticket Chiuso**\n👤 Chiuso da: ${interaction.user}\n📌 Canale: ${interaction.channel}`
                );

            }


            setTimeout(() => {

                interaction.channel.delete()
                    .catch(() => {});

            }, 3000);

        }

    }

};
