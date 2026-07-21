const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    MessageFlags
} = require("discord.js");

// CONFIG ID RUOLI & PERMESSI (Elegance Sponsoring)
const COMMAND_ROLE_ID = "1528576014446231683";      // Ruolo autorizzato ad eseguire /verify
const VERIFY_ROLE_ID = "1528576026421231726";       // Ruolo che viene AGGIUNTO (Verificato)
const UNVERIFIED_ROLE_ID = "1528576023032102972";   // Ruolo che viene RIMOSSO (Non Verificato)

const captchaCache = new Map();

function generateCaptcha() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

module.exports = {
    // Metadati aggiuntivi spesso richiesti dai comandi/deployer custom
    category: "utility",
    description: "Invia il pannello ufficiale di verifica del server",
    
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Invia il pannello ufficiale di verifica del server"),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(COMMAND_ROLE_ID)) {
            console.warn(`[SECURITY] Tentativo non autorizzato di /verify da parte di ${interaction.user.tag}`);
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per inviare questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("🔓 ELEGANCE SPONSORING ── VERIFICA ACCOUNT")
            .setDescription(
                "Benvenuto nel server ufficiale di **Elegance Sponsoring**!\n\n" +
                "Per accedere a tutte le categorie, i canali testuali e i servizi della nostra community, è necessario completare il test di sicurezza anti-bot.\n\n" +
                "📌 **Come verificarsi:**\n" +
                "1. Clicca sul pulsante **🔓 Verifica Ora** qui sotto.\n" +
                "2. Inserisci il codice **CAPTCHA** generato nel modulo.\n" +
                "3. Invia il modulo per sbloccare l'accesso al server.\n\n" +
                "❓ *In caso di problemi o per richiedere assistenza, apri un ticket nella sezione supporto.*"
            )
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • System Protection", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("verify_button")
                .setLabel("🔓 Verifica Ora")
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({
            embeds: [embed],
            components: [button]
        });
    },

    async buttonHandler(interaction) {
        if (interaction.member.roles.cache.has(VERIFY_ROLE_ID)) {
            return interaction.reply({
                content: "⚠️ **Sei già verificato!** Non hai bisogno di ripetere il processo.",
                flags: MessageFlags.Ephemeral
            });
        }

        const captcha = generateCaptcha();

        captchaCache.set(interaction.user.id, {
            code: captcha,
            expires: Date.now() + 60000
        });

        setTimeout(() => {
            if (captchaCache.has(interaction.user.id)) {
                captchaCache.delete(interaction.user.id);
            }
        }, 65000);

        const modal = new ModalBuilder()
            .setCustomId("verify_modal")
            .setTitle("Verifica Anti-Bot");

        const input = new TextInputBuilder()
            .setCustomId("captcha_input")
            .setLabel(`Codice da inserire: ${captcha}`)
            .setPlaceholder("Scrivi qui il codice (es: A1B2C)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },

    async modalHandler(interaction) {
        const data = captchaCache.get(interaction.user.id);

        if (!data || Date.now() > data.expires) {
            captchaCache.delete(interaction.user.id);
            return interaction.reply({
                content: "⏳ **Tempo Scaduto:** Il codice CAPTCHA è scaduto. Clicca nuovamente sul pulsante per rigenerarne uno nuovo.",
                flags: MessageFlags.Ephemeral
            });
        }

        const answer = interaction.fields.getTextInputValue("captcha_input");

        if (answer.toUpperCase().trim() !== data.code.toUpperCase()) {
            return interaction.reply({
                content: "❌ **Codice Errato:** Il codice inserito non corrisponde. Clicca di nuovo sul pulsante per riprovare.",
                flags: MessageFlags.Ephemeral
            });
        }

        const member = interaction.member;
        const verifiedRole = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);
        const unverifiedRole = interaction.guild.roles.cache.get(UNVERIFIED_ROLE_ID);

        try {
            if (unverifiedRole && member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
                await member.roles.remove(unverifiedRole);
            }

            if (verifiedRole && !member.roles.cache.has(VERIFY_ROLE_ID)) {
                await member.roles.add(verifiedRole);
            }

            captchaCache.delete(interaction.user.id);

            await interaction.reply({
                content: "✅ **Verifica Completata!** I tuoi permessi sono stati aggiornati. Benvenuto su Elegance Sponsoring!",
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error("[VERIFY_ERROR] Errore nell'assegnazione dei ruoli:", error);
            await interaction.reply({
                content: "❌ **Errore di Sistema:** Impossibile aggiornare i tuoi ruoli. Verifica che il ruolo del bot sia posizionato più in alto dei ruoli da assegnare nelle impostazioni del server.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
            
