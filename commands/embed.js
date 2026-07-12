const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const EMBED_ROLE_ID = "1505192718068879430";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Crea un embed tramite Elegance-Bot")
        .addStringOption(option =>
            option
                .setName("titolo")
                .setDescription("Titolo dell'embed")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione dell'embed")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("colore")
                .setDescription("Colore HEX dell'embed (es: #5865F2)")
                .setRequired(false)
        ),

    async execute(interaction) {

        if (!interaction.member.roles.cache.has(EMBED_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Non hai il permesso di usare questo comando.",
                ephemeral: true
            });
        }

        const titolo = interaction.options.getString("titolo");
        const descrizione = interaction.options.getString("descrizione");
        const colore = interaction.options.getString("colore") || "#5865F2";

        const embed = new EmbedBuilder()
            .setTitle(titolo)
            .setDescription(descrizione)
            .setColor(colore)
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};
