// ==========================================
// FILE: jailCard.js
// ==========================================
const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits,
    MessageFlags 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jail-card")
        .setDescription("Invia l'annuncio ufficiale per la Get Out of Jail Card")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Devi essere un Amministratore per inviare questo annuncio.",
                flags: MessageFlags.Ephemeral
            });
        }

        const announcementText = 
            `﹒✦〞﹒ɴ ᴜ ᴏ ᴠ ᴀ   ꜰ ᴜ ɴ ᴢ ɪ ᴏ ɴ ᴇ   ᴇ   ʀ ᴇ ɢ ᴀ ʟ ᴏ\n\n` +
            `Per il ritorno della nostra community ho deciso di darvi un bellissimo regalo in DM dal bot. Basta cliccare il bottone sottostante.\n` +
            `Niente spoiler (:\n\n` +
            `────────────────────────────────────\n\n` +
            `✦  ᴄ ᴏ ᴍ ᴇ  ꜰ ᴜ ɴ ᴢ ɪ ᴏ ɴ ᴀ\n` +
            `• Clicca sul pulsante qui sotto quando vuoi richiedere la rimozione di un provvedimento (Timeout/Warn).\n` +
            `• La richiesta verrà inviata direttamente allo Staff per l'approvazione.\n` +
            `• Nota: La carta ha un cooldown di 24 ore tra un utilizzo e l'altro.\n\n` +
            `────────────────────────────────────\n\n` +
            `@everyone`;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("use_jail_card")
                .setLabel('Usa Carta "Get Out of Jail"')
                .setEmoji("🃏")
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.channel.send({
            content: announcementText,
            components: [row]
        });

        await interaction.reply({
            content: "✅ Annuncio inviato con successo nel canale!",
            flags: MessageFlags.Ephemeral
        });
    }
};
