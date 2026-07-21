const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits,
    MessageFlags 
} = require("discord.js");

// Salva la configurazione in memoria (Puoi personalizzare gli ID canale qui)
const entryConfig = {
    welcomeChannel: null, // ID Canale Benvenuto
    leaveChannel: null,   // ID Canale Addio
    welcomeEnabled: true,
    leaveEnabled: true
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("entry")
        .setDescription("Gestisci i messaggi di Benvenuto e Addio del server")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO ENTRY")
            .setDescription(
                "Da questo pannello puoi gestire e configurare il sistema di **Benvenuto** e **Addio** per il server.\n\n" +
                `📌 **Canale Benvenuto:** ${entryConfig.welcomeChannel ? `<#${entryConfig.welcomeConfig}>` : "`Non impostato (Usa canale corrente)`"}\n` +
                `📌 **Canale Addio:** ${entryConfig.leaveChannel ? `<#${entryConfig.leaveChannel}>` : "`Non impostato (Usa canale corrente)`"}\n\n` +
                `• **Stato Benvenuto:** ${entryConfig.welcomeEnabled ? "🟢 Attivo" : "🔴 Disattivato"}\n` +
                `• **Stato Addio:** ${entryConfig.leaveEnabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • System Control" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("entry_toggle_welcome")
                .setLabel(entryConfig.welcomeEnabled ? "Disattiva Benvenuto" : "Attiva Benvenuto")
                .setStyle(entryConfig.welcomeEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("entry_toggle_leave")
                .setLabel(entryConfig.leaveEnabled ? "Disattiva Addio" : "Attiva Addio")
                .setStyle(entryConfig.leaveEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("entry_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    },

    // Gestore dei Bottoni del Pannello
    async buttonHandler(interaction) {
        const { customId, channel } = interaction;

        if (customId === "entry_toggle_welcome") {
            entryConfig.welcomeEnabled = !entryConfig.welcomeEnabled;
        } else if (customId === "entry_toggle_leave") {
            entryConfig.leaveEnabled = !entryConfig.leaveEnabled;
        } else if (customId === "entry_set_channel") {
            entryConfig.welcomeChannel = channel.id;
            entryConfig.leaveChannel = channel.id;
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO ENTRY")
            .setDescription(
                "Stato della configurazione aggiornato con successo!\n\n" +
                `📌 **Canale Impostato:** <#${entryConfig.welcomeChannel || channel.id}>\n\n` +
                `• **Stato Benvenuto:** ${entryConfig.welcomeEnabled ? "🟢 Attivo" : "🔴 Disattivato"}\n` +
                `• **Stato Addio:** ${entryConfig.leaveEnabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("entry_toggle_welcome")
                .setLabel(entryConfig.welcomeEnabled ? "Disattiva Benvenuto" : "Attiva Benvenuto")
                .setStyle(entryConfig.welcomeEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("entry_toggle_leave")
                .setLabel(entryConfig.leaveEnabled ? "Disattiva Addio" : "Attiva Addio")
                .setStyle(entryConfig.leaveEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("entry_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ embeds: [embed], components: [row] });
    },

    // Funzione da collegare agli eventi Discord per inviare l'embed in automatico
    async handleMemberAdd(member) {
        if (!entryConfig.welcomeEnabled) return;

        const channelId = entryConfig.welcomeChannel || member.guild.systemChannelId;
        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle("👋 ELEGANCE SPONSORING ── BENVENUTO/A!")
            .setDescription(
                `Benvenuto/a ${member} all'interno della nostra community ufficiale!\n\n` +
                "────────────────────────────────────────\n\n" +
                "✧ ᴀsᴘᴇᴛᴛɪ ғᴏɴᴅᴀᴍᴇɴᴛᴀʟɪ\n" +
                " • 📜 Leggi il regolamento nel canale dedicato per evitare sanzioni.\n" +
                " • 🔓 Completa la verifica per sbloccare tutti i canali del server.\n" +
                " • 🎟️ Apri un ticket nella sezione supporto se hai bisogno di aiuto.\n\n" +
                "────────────────────────────────────────\n\n" +
                "✧ ɪɴғᴏ ᴍᴇᴍʙʀᴏ\n" +
                ` • 👤 **Account:** ${member.user.tag}\n` +
                ` • 📊 **Membro N°:** ${member.guild.memberCount}\n\n` +
                "Buona permanenza e divertiti con noi!"
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • Welcome System", iconURL: member.guild.iconURL() })
            .setTimestamp();

        await channel.send({ content: `👋 Benvenuto/a ${member}!`, embeds: [embed] });
    },

    async handleMemberRemove(member) {
        if (!entryConfig.leaveEnabled) return;

        const channelId = entryConfig.leaveChannel || member.guild.systemChannelId;
        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle("👋 ELEGANCE SPONSORING ── ARRIVEDERCI")
            .setDescription(
                `L'utente **${member.user.tag}** ha lasciato la community.\n\n` +
                "────────────────────────────────────────\n\n" +
                `• 📊 Ora siamo in **${member.guild.memberCount}** membri su Elegance Sponsoring.\n` +
                "• 🚪 Speriamo di rivederci presto!"
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(0xFF0055)
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }
};
              
