const { SlashCommandBuilder, EmbedBuilder, version: discordJsVersion } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info-bot")
        .setDescription("🤖 Scheda tecnica, statistiche e moduli attivi del sistema."),

    async execute(interaction) {
        const client = interaction.client;
        
        // Timestamp dinamico di Discord per l'avvio
        const startTime = Math.floor((Date.now() - client.uptime) / 1000);

        const embed = new EmbedBuilder()
            .setTitle(`🤖 Scheda Informativa — ${client.user.username}`)
            .setColor(0x5865F2)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(
                "### 🛡️ Core Management System\n" +
                "Un'infrastruttura modulare e centralizzata progettata per garantire **sicurezza, tracciamento completo ed automazione flessibile** nel server.\n\n" +
                "Il sistema opera tramite archiviazione unificata (`setups.json`) garantendo elevate prestazioni senza dispersioni di dati."
            )
            .addFields(
                { 
                    name: "🧱 Architettura dei Moduli Core", 
                    value: 
                        "```gcode\n" +
                        "├─ 📜 Log System      -> Monitoraggio eventi & Audit Logs\n" +
                        "├─ 🚪 Entry & Welcome -> Gestione accoglienza & autoruoli\n" +
                        "├─ 📝 Apply System    -> Candidature & Form interattivi\n" +
                        "└─ 🔗 Invites Tracker -> Tracciamento inviti & statistiche\n" +
                        "```", 
                    inline: false 
                },
                { 
                    name: "📊 Statistiche Server", 
                    value: `> 🏰 **Server:** \`${client.guilds.cache.size}\`\n> 👤 **Membri Gestiti:** \`${client.users.cache.size}\``, 
                    inline: true 
                },
                { 
                    name: "⏱️ Stato di Attività", 
                    value: `> 🚀 **Online da:** <t:${startTime}:R>\n> 📅 **Data avvio:** <t:${startTime}:f>`, 
                    inline: true 
                },
                { 
                    name: "💻 Dettagli Tecnici", 
                    value: `\`\`\`yaml\nEngine: Node.js ${process.version}\nLibrary: Discord.js v${discordJsVersion}\nEnvironment: Production Ready\n\`\`\``, 
                    inline: false 
                }
            )
            .setFooter({ 
                text: `${client.user.username} • Sistema di Gestione Avanzato`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
