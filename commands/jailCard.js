// ==========================================
// FILE: jailCard.js
// ==========================================
const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits,
    EmbedBuilder,
    MessageFlags 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jail-card")
        .setDescription("Invia l'annuncio per la Jail Card regalo")
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
            `✦  ᴄ ᴏ ᴍ ᴇ  ʀ ɪ ᴄ ᴇ ᴠ ᴇ ʀ ʟ ᴏ\n` +
            `• Clicca sul pulsante **"Ricevi il Regalo in DM"** qui sotto.\n` +
            `• Riceverai subito la tua speciale **"Get Out of Jail Free" Card** nei messaggi privati!\n` +
            `• Assicurati di avere i DM aperti con il server.\n\n` +
            `────────────────────────────────────\n\n` +
            `Grazie di cuore per la lettura e l'attenzione!\n\n` +
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
            content: "✅ Annuncio della Jail Card inviato con successo!",
            flags: MessageFlags.Ephemeral
        });
    },

    // --- HANDLER RICHIAMATO DAL REGISTRY O BUTTON HANDLER ---
    async handleClaimDM(interaction) {
        try {
            const dmWelcomeEmbed = new EmbedBuilder()
                .setTitle("🎉 Il tuo Regalo di Benvenuto!")
                .setDescription(
                    `Ciao **${interaction.user.username}**, ecco il regalo speciale per il ritorno della nostra community!\n\n` +
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
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error(`[JAIL CARD DM ❌ ERRORE]:`, error);
            await interaction.reply({
                content: "❌ Impossibile inviarti il messaggio privato. Assicurati di avere i **DM aperti** per questo server nelle tue impostazioni di privacy!",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
