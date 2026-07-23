const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("⚡ Misura le prestazioni in tempo reale e la latenza del bot."),

    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: "📡 *Analisi della connessione ai server Discord in corso...*", 
            fetchReply: true, 
            ephemeral: true 
        });

        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        // Determinazione dello stato della rete
        let statusEmoji = "🟢";
        let statusText = "Eccellente";
        if (apiLatency > 150) { statusEmoji = "🟡"; statusText = "Stabile"; }
        if (apiLatency > 250) { statusEmoji = "🔴"; statusText = "Latenza Elevata"; }

        const embed = new EmbedBuilder()
            .setTitle("⚡ Diagnostica di Rete & Latenza")
            .setColor(apiLatency > 200 ? 0xED4245 : 0x57F287)
            .setDescription(
                `> Stato dei servizi: **${statusEmoji} ${statusText}**\n` +
                "I tempi di risposta indicano la velocità con cui il bot elabora i comandi e comunica con gli endpoint ufficiali di Discord."
            )
            .addFields(
                { 
                    name: "🏓 Latenza Bot (RTT)", 
                    value: `\`\`\`css\n${roundtripLatency} ms\n\`\`\``, 
                    inline: true 
                },
                { 
                    name: "🌐 WebSocket API", 
                    value: `\`\`\`css\n${apiLatency} ms\n\`\`\``, 
                    inline: true 
                },
                { 
                    name: "⚙️ Reattività Core", 
                    value: `\`\`\`css\n${Math.abs(roundtripLatency - apiLatency)} ms\n\`\`\``, 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `Richiesto da ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};
