// ==========================================
// FILE: jailCard.js
// ==========================================
const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jail-card")
        .setDescription("Invia l'annuncio per permettere agli utenti di ricevere la Jail Card in DM")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Devi essere un Amministratore per inviare questo annuncio.",
                ephemeral: true
            });
        }

        const announcementText = 
            `﹒✦〞﹒ɴ ᴜ ᴏ ᴠ ᴀ   ꜰ ᴜ ɴ ᴢ ɪ ᴏ ɴ ᴇ   ᴇ   ʀ ᴇ ɢ ᴀ ʟ ᴏ\n\n` +
            `Per il ritorno della nostra community, ho deciso di darvi un bellissimo regalo inviato direttamente in DM dal bot!\n\n` +
            `────────────────────────────────────\n\n` +
            `✦  ᴄ ᴏ ᴍ ᴇ  ʀ ɪ ᴄ ᴇ ᴠ ᴇ ʀ ʟ ᴏ\n` +
            `• Basta semplicemente cliccare il bottone qui sotto.\n` +
            `• Riceverai subito un messaggio privato dal bot con la tua speciale carta ed il relativo pulsante per utilizzarla.\n` +
            `• Niente spoiler... scopri in DM di cosa si tratta! 😉\n\n` +
            `────────────────────────────────────\n\n` +
            `Grazie di cuore a tutti per la lettura, l'attenzione e la costante presenza!\n` +
            `-# sta per arrivare un grande aggiornamento? Chissà\n\n` +
            `@everyone`;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("claim_jail_card_dm")
                .setLabel("Ricevi il Regalo in DM")
                .setEmoji("🎁")
                .setStyle(ButtonStyle.Success)
        );

        await interaction.channel.send({
            content: announcementText,
            components: [row]
        });

        await interaction.reply({
            content: "✅ Annuncio inviato con successo nel canale!",
            ephemeral: true
        });
    }
};
