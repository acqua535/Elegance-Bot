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

const BYPASS_USER_ID = "1504206598728323174";

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
            `✦  ᴄ ᴏ ᴍ ᴇ  ʀ ɪ ᴄ ᴇ ᴠ ᴇ ʀ ʟ ᴏ\n` +
            `• Clicca sul pulsante qui sotto per ricevere la tua carta direttamente nei messaggi privati.\n` +
            `• Assicurati di avere i DM del server abilitati.\n\n` +
            `────────────────────────────────────\n\n` +
            `@everyone`;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("jail_card_announcement_btn")
                .setLabel("Ricevi Carta in DM")
                .setEmoji("🎁")
                .setStyle(ButtonStyle.Success)
        );

        await interaction.channel.send({
            content: announcementText,
            components: [row]
        });

        await interaction.reply({
            content: "✅ Annuncio inviato con successo nel canale!",
            flags: MessageFlags.Ephemeral
        });
    },

    // --- AZIONE RICHIAMATA DA REGISTRY.JS ---
    async buttonHandler(interaction) {
        try {
            const isBypassUser = interaction.user.id === BYPASS_USER_ID;

            const dmWelcomeEmbed = new EmbedBuilder()
                .setTitle("🎉 Il tuo Regalo di Benvenuto!")
                .setDescription(
                    `Ciao **${interaction.user.username}**, ecco la tua speciale **"Get Out of Jail Free" Card**!\n\n` +
                    `🚨 **A cosa serve?**\n` +
                    `Se in futuro dovessi ricevere un provvedimento minore (come un **Timeout** o un **Warn**), potrai premere il pulsante qui sotto per inoltrare la richiesta di annullamento allo Staff!\n\n` +
                    (isBypassUser 
                        ? `👑 **ACCOUNT VIP DETECTED:** Hai utilizzi illimitati e nessun cooldown!` 
                        : `⚠️ *Nota bene: Questa carta ha un cooldown di 24 ore dopo ogni utilizzo e non funziona sui Ban.*`)
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
                content: "📩 **Ti ho inviato la carta nei tuoi messaggi privati (DM)!** Controlla la chat del bot.",
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error(`[JAIL CARD ❌ ERRORE DM]:`, error);
            await interaction.reply({
                content: "❌ Impossibile inviarti il messaggio privato. Attiva i **DM del server** nelle impostazioni della privacy!",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
