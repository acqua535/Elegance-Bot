const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const moderation = require("./moderationSystem");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("warnings")

        .setDescription("Mostra tutti i warn di un utente")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        )

        .addUserOption(option =>
            option
                .setName("utente")
                .setDescription("Utente da controllare")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user =
            interaction.options.getUser("utente");

        const warnings =
            moderation.getWarnings(user.id);

        if (warnings.length === 0) {

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setTitle("📋 Warnings")

                        .setDescription(
                            `${user} non ha alcun warn.`
                        )

                        .setColor("Green")

                ]

            });

        }

        let description = "";

        warnings.forEach((warn, index) => {

            description +=
`### ${index + 1}
🛡️ Staff: <@${warn.moderator}>
📝 Motivo: ${warn.reason}
📅 Data: <t:${Math.floor(warn.date / 1000)}:F>

`;

        });

        const embed = new EmbedBuilder()

            .setTitle(`📋 Warn di ${user.username}`)

            .setThumbnail(user.displayAvatarURL())

            .setDescription(description)

            .addFields({

                name: "📊 Totale",

                value: `${warnings.length} warn`

            })

            .setColor("Orange")

            .setTimestamp();

        await interaction.reply({

            embeds: [embed]

        });

    }

};
