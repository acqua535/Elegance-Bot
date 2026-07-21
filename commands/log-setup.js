const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../logConfig.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("log-setup")
        .setDescription("Configura il canale per tutti i Server Logs (stile Probot)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("canale")
                .setDescription("Seleziona il canale log (lascia vuoto per usare quello corrente)")
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetChannel = interaction.options.getChannel("canale") || interaction.channel;

        if (!targetChannel.isTextBased()) {
            return interaction.reply({
                content: "❌ Il canale selezionato deve essere un canale testuale!",
                ephemeral: true
            });
        }

        try {
            // Salva l'ID su file JSON
            fs.writeFileSync(configPath, JSON.stringify({ channelId: targetChannel.id }, null, 2));

            const embed = new EmbedBuilder()
                .setTitle("⚙️ SISTEMA LOG CONFIGURATO")
                .setColor(0x5865F2)
                .setDescription(`Tutti i log del server stile Probot verranno ora inviati in ${targetChannel}!`)
                .addFields({
                    name: "📌 Eventi Monitorati",
                    value: "• Ingressi & Uscite\n• Messaggi Eliminati & Modificati\n• Canali Vocali (Entrata, Uscita, Spostamento)\n• Creazione / Eliminazione Canali\n• Ban Utenti",
                    inline: false
                })
                .setFooter({ text: "Elegance Logs • System Active" })
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] });

            return interaction.reply({
                content: `✅ Canale log impostato con successo su ${targetChannel}!`,
                ephemeral: true
            });
        } catch (err) {
            console.error("Errore durante il salvataggio dei log:", err);
            return interaction.reply({
                content: "❌ Errore durante il salvataggio della configurazione dei log.",
                ephemeral: true
            });
        }
    }
};
