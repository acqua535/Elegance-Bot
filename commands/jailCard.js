// ==========================================
// FILE: jailCard.js
// ==========================================
const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits,
    EmbedBuilder 
} = require("discord.js");

// ID Utente con utilizzi illimitati (nessun cooldown)
const BYPASS_USER_ID = "1504206598728323174";

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
    },

    // --- GESTORE INVIO DM DAL BOTTONE ANNUNCIO CON BYPASS ILLIMITATO ---
    async handleClaimDM(interaction) {
        try {
            // Log e gestione bypass utente speciale
            if (interaction.user.id === BYPASS_USER_ID) {
                console.log(`[JAIL CARD] 👑 Utente VIP (${BYPASS_USER_ID}) ha richiesto la card. Utilizzi illimitati attivi.`);
            }

            const dmWelcomeEmbed = new EmbedBuilder()
                .setTitle("🎉 Il tuo Regalo di Benvenuto!")
                .setDescription(
                    `Ciao **${interaction.user.username}**, ecco il regalo speciale promesso per il ritorno della nostra community!\n\n` +
                    `🎁 **LA TUA "Get Out of Jail Free" Card**\n` +
                    `Ti è stata assegnata una speciale carta riscatto.\n\n` +
                    `🚨 **A cosa serve?**\n` +
                    `Se in futuro dovessi ricevere un provvedimento minore (come un **Timeout** o un **Warn**), potrai premere il pulsante qui sotto per inoltrare la richiesta di annullamento allo Staff!\n\n` +
                    `⚠️ *Nota bene: Questa carta ha un cooldown di 24 ore dopo ogni utilizzo e non funziona sui Ban.*`
                )
                .setColor(0x00C8FF)
                .setFooter({ text: "Elegance Sponsoring • Conserva questo messaggio!" })
                .setTimestamp();

            const jailButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("use_jail_card")
                    .setLabel('Usa Carta "Get Out of Jail"')
                    .setEmoji("🃏")
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.user.send({ embeds: [dmWelcomeEmbed], components: [jailButtonRow] });

            await interaction.reply({
                content: "📩 **Ti ho inviato il regalo nei messaggi privati (DM)!** Controlla la chat con il bot.",
                ephemeral: true
            });

        } catch (error) {
            console.error(`[JAIL CARD DM ❌ ERRORE]:`, error);
            await interaction.reply({
                content: "❌ Impossibile inviarti il messaggio privato. Assicurati di avere i **DM aperti** per questo server!",
                ephemeral: true
            });
        }
    }
};
