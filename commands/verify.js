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

// CONFIG ID RUOLI CORRETTI (Elegance Sponsoring)
const COMMAND_ROLE_ID = "1528576014446231683";     // Ruolo autorizzato ad inviare /verify
const VERIFY_ROLE_ID = "1528576073833517168";      // Ruolo VERIFICATO (Membri)
const UNVERIFIED_ROLE_ID = "1528576075007791185";  // Ruolo NON VERIFICATO

function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Esclusi caratteri ambigui
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Invia il pannello ufficiale di verifica del server"),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(COMMAND_ROLE_ID)) {
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
        const captcha = generateCaptcha();

        const modal = new ModalBuilder()
            .setCustomId(`verify_modal_${captcha}`)
            .setTitle("Verifica Anti-Bot");

        const input = new TextInputBuilder()
            .setCustomId("captcha_input")
            .setLabel(`Inserisci questo codice: ${captcha}`)
            .setPlaceholder(`Esempio: ${captcha}`)
            .setStyle(TextInputStyle.Short)
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },

    async modalHandler(interaction) {
        const expectedCode = interaction.customId.replace("verify_modal_", "");
        const answer = interaction.fields.getTextInputValue("captcha_input").trim().toUpperCase();

        if (answer !== expectedCode) {
            return interaction.reply({
                content: `❌ **Codice Errato:** Hai scritto \`${answer}\`, ma il codice era \`${expectedCode}\`. Clicca di nuovo su Verifica per riprovare.`,
                flags: MessageFlags.Ephemeral
            });
        }

        const member = interaction.member;
        const verifiedRole = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);
        const unverifiedRole = interaction.guild.roles.cache.get(UNVERIFIED_ROLE_ID);

        try {
            // Rimuove il ruolo Non Verificato (se presente)
            if (unverifiedRole && member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
                await member.roles.remove(unverifiedRole);
            }

            // Aggiunge il ruolo Verificato
            if (verifiedRole) {
                await member.roles.add(verifiedRole);
            }

            await interaction.reply({
                content: "✅ **Verifica Completata!** Il tuo account è stato verificato con successo. Benvenuto su Elegance Sponsoring!",
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error("[VERIFY_ERROR] Errore nell'assegnazione dei ruoli:", error);
            await interaction.reply({
                content: "❌ **Errore di Sistema:** Impossibile aggiornare i tuoi ruoli. Verifica che la gerarchia dei ruoli del bot sia posizionata sopra i ruoli da assegnare.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
