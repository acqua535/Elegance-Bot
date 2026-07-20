const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Canale suggerimenti (Usato ID: 1528576017579643072)
const SUGGEST_CHANNEL_ID = "1528576017579643072";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Invia un suggerimento alla community")
        .addStringOption(option =>
            option
                .setName("idea")
                .setDescription("Il tuo suggerimento")
                .setRequired(true)
        ),

    async execute(interaction) {
        const idea = interaction.options.getString("idea");
        const channel = interaction.guild.channels.cache.get(SUGGEST_CHANNEL_ID);

        if (!channel) {
            return interaction.reply({
                content: "❌ Canale suggerimenti non trovato.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("💡 Nuovo Suggerimento")
            .setColor("Blue")
            .setDescription(`**Idea:**\n${idea}`)
            .addFields(
                { name: "👤 Autore", value: `${interaction.user}`, inline: true },
                { name: "📊 Stato", value: "🟡 In valutazione", inline: true }
            )
            .setFooter({ text: "⚜️ Elegance Sponsoring • Suggerimenti" })
            .setTimestamp();

        const message = await channel.send({ embeds: [embed] });

        // Aggiunta reazioni
        await message.react("👍");
        await message.react("👎");

        // Creazione thread
        const thread = await message.startThread({
            name: `💡 Discussione suggerimento`,
            autoArchiveDuration: 1440
        });

        await thread.send({
            content: "⚜️ Discussione aperta.\nPotete parlare qui della proposta."
        });

        await interaction.reply({
            content: "✅ Suggerimento inviato!",
            ephemeral: true
        });
    }
};
