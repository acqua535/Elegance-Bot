const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { Setup } = require("./Setup");

const ALLOWED_ROLE_ID = "1528576032670482502";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll-log")
        .setDescription("Imposta il canale in cui inviare i log dettagliati dei sondaggi")
        .addChannelOption(option =>
            option.setName("canale")
                .setDescription("Il canale dove inviare i log")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return await interaction.reply({ content: "❌ Non hai i permessi necessari.", ephemeral: true });
        }

        const targetChannel = interaction.options.getChannel("canale");

        await Setup.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { pollLogChannel: targetChannel.id },
            { upsert: true, new: true }
        );

        const embed = new EmbedBuilder()
            .setColor("#00FFCC")
            .setTitle("📊 Configurazione Log Sondaggi")
            .setDescription(`Canale impostato su ${targetChannel}!`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
