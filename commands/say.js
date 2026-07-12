const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Invia un messaggio tramite Elegance-Bot")
        .addStringOption(option =>
            option
                .setName("messaggio")
                .setDescription("Il messaggio da inviare")
                .setRequired(true)
        ),

    async execute(interaction) {
        const messaggio = interaction.options.getString("messaggio");

        const embed = new EmbedBuilder()
            .setTitle("⚜️ ELEGANCE")
            .setDescription(messaggio)
            .setFooter({
                text: `Richiesto da ${interaction.user.tag}`
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};
