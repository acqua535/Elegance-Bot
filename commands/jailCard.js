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
        .setDescription("Invia l'annuncio per il regalo speciale in DM (Jail Card)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Verifica permessi amministratore
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Devi essere un Amministratore per inviare questo annuncio.",
                ephemeral: true
            });
        }

        const announcementText = 
            `﹒✦〞﹒ɴ ᴜ ᴏ ᴠ ᴏ   ʀ ᴇ ɢ ᴀ ʟ ᴏ   ᴅ ɪ   ʙ ᴇ ɴ ᴠ ᴇ ɴ ᴜ ᴛ ᴏ\n\n` +
            `Per festeggiare il ritorno della nostra community, abbiamo deciso di farvi un bellissimo **regalo speciale** recapitato direttamente nei vostri messaggi privati dal nostro bot!\n\n` +
            `────────────────────────────────────\n\n` +
            `✦  ᴄ ᴏ ᴍ ᴇ  ʀ ɪ ꜱ ᴄ ᴀ ᴛ ᴛ ᴀ ʀ ʟ ᴏ\n` +
            `• Basta semplicemente cliccare sul bottone qui sotto per ricevere la tua sorpresa.\n` +
            `• Niente spoiler... scopri direttamente in DM di cosa si tratta! 😉\n` +
            `• Assicurati di avere i messaggi privati (DM) aperti per permettere al bot di contattarti.\n\n` +
            `────────────────────────────────────\n\n` +
            `Grazie di cuore a tutti per la lettura, il supporto e la costante presenza!\n` +
            `-# sta per arrivare un grande aggiornamento? Chissà\n\n` +
            `@everyone`;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("use_jail_card")
                .setLabel("Riscatta il Regalo")
                .setEmoji("🎁")
                .setStyle(ButtonStyle.Success)
        );

        // Invio del messaggio pubblico nel canale
        await interaction.channel.send({
            content: announcementText,
            components: [row]
        });

        // Risposta di conferma visibile solo all'amministratore
        await interaction.reply({
            content: "✅ Annuncio della **Jail Card** inviato con successo nel canale!",
            ephemeral: true
        });
    }
};
