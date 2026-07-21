const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags
} = require("discord.js");

const STAFF_ROLE_ID = "1528576014446231683";

// Configurazione locale del sistema candidature
const applyConfig = {
    targetChannel: null, // ID Canale dove arrivano le candidature
    enabled: true
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("apply")
        .setDescription("Gestisci o invia il pannello delle candidature Staff")
        .addSubcommand(sub =>
            sub.setName("panel")
               .setDescription("Pannello di controllo del sistema candidature (Solo Staff)"))
        .addSubcommand(sub =>
            sub.setName("send")
               .setDescription("Invia l'embed pubblico per le candidature nel canale corrente (Solo Staff)")),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire le candidature.",
                flags: MessageFlags.Ephemeral
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "panel") {
            const embed = new EmbedBuilder()
                .setTitle("⚙️ ELEGANCE SPONSORING ── CONFIGURAZIONE CANDIDATURE")
                .setDescription(
                    "Da questo pannello puoi attivare/disattivare il sistema e impostare il canale dove lo Staff riceverà le candidature inoltrate.\n\n" +
                    `📌 **Canale Ricezione Moduli:** ${applyConfig.targetChannel ? `<#${applyConfig.targetChannel}>` : "`Non impostato (Usa canale corrente)`"}\n` +
                    `• **Stato Candidature:** ${applyConfig.enabled ? "🟢 Aperte" : "🔴 Chiuse"}`
                )
                .setColor(0x00FF99)
                .setFooter({ text: "Elegance Sponsoring • Apply Control" })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("apply_toggle")
                    .setLabel(applyConfig.enabled ? "Chiudi Candidature" : "Apri Candidature")
                    .setStyle(applyConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("apply_set_channel")
                    .setLabel("📌 Imposta Canale Ricezione")
                    .setStyle(ButtonStyle.Primary)
            );

            return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
        }

        if (subcommand === "send") {
            const publicEmbed = new EmbedBuilder()
                .setTitle("📝 ELEGANCE SPONSORING ── CANDIDATURE STAFF")
                .setDescription(
                    "Vorresti fare parte dello staff ufficiale di **Elegance Sponsoring**?\n" +
                    "Stiamo cercando persone motivate, attive ed educate per ampliare il nostro team!\n\n" +
                    "────────────────────────────────────────\n\n" +
                    "✧ ʀᴇǫᴜɪsɪᴛɪ & Linee Guida\n" +
                    " • 📜 Conoscenza approfondita del regolamento del server.\n" +
                    " • 🤝 Rispetto, massima serietà e nessuna attitudine al trolling.\n" +
                    " • ⏱️ Buona disponibilità di tempo e presenza attiva nei canali.\n\n" +
                    "────────────────────────────────────────\n\n" +
                    "✧ ᴄᴏᴍᴇ Cᴀɴᴅɪᴅᴀʀsɪ\n" +
                    "1. Clicca sul pulsante **📝 Candidati Ora** qui sotto.\n" +
                    "2. Compila il modulo che apparirà a schermo.\n" +
                    "3. Invia la candidatura per farla pervenire agli Amministratori.\n\n" +
                    "⚠️ *Nota: Risposte non serie o goliardiche porteranno al rifiuto e a possibili sanzioni.*"
                )
                .setColor(0x00FF99)
                .setFooter({ text: "Elegance Sponsoring • Staff Recruitment", iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("apply_start_button")
                    .setLabel("📝 Candidati Ora")
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.channel.send({ embeds: [publicEmbed], components: [button] });
            return interaction.reply({ content: "✅ Pannello candidature inviato con successo!", flags: MessageFlags.Ephemeral });
        }
    },

    // Gestore dei Bottoni
    async buttonHandler(interaction) {
        const { customId, channel, guild, user } = interaction;

        // Toggle Apertura/Chiusura
        if (customId === "apply_toggle") {
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({ content: "❌ Permessi insufficienti.", flags: MessageFlags.Ephemeral });
            }
            applyConfig.enabled = !applyConfig.enabled;
            return module.exports.updatePanelMessage(interaction);
        }

        // Imposta Canale Corrente
        if (customId === "apply_set_channel") {
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({ content: "❌ Permessi insufficienti.", flags: MessageFlags.Ephemeral });
            }
            applyConfig.targetChannel = channel.id;
            return module.exports.updatePanelMessage(interaction);
        }

        // Clic su "Candidati Ora" (Apre la Modal del modulo)
        if (customId === "apply_start_button") {
            if (!applyConfig.enabled) {
                return interaction.reply({
                    content: "🔒 **Candidature Chiuse:** Al momento le candidature Staff sono temporaneamente sospese.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const modal = new ModalBuilder()
                .setCustomId("apply_form_modal")
                .setTitle("Candidatura Staff Ufficiale");

            const q1 = new TextInputBuilder()
                .setCustomId("apply_q1")
                .setLabel("Età e orari di disponibilità sul server:")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const q2 = new TextInputBuilder()
                .setCustomId("apply_q2")
                .setLabel("Hai già esperienze come Staff Discord?")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const q3 = new TextInputBuilder()
                .setCustomId("apply_q3")
                .setLabel("Perché dovremmo scegliere te?")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const q4 = new TextInputBuilder()
                .setCustomId("apply_q4")
                .setLabel("Come gestisci utenti provocatori/troll?")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(q1),
                new ActionRowBuilder().addComponents(q2),
                new ActionRowBuilder().addComponents(q3),
                new ActionRowBuilder().addComponents(q4)
            );

            return await interaction.showModal(modal);
        }

        // Gestione Azioni Staff (Accetta / Rifiuta)
        if (customId.startsWith("apply_accept_") || customId.startsWith("apply_reject_")) {
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({ content: "❌ Non hai i permessi per gestire questa candidatura.", flags: MessageFlags.Ephemeral });
            }

            const applicantId = customId.split("_")[2];
            const applicant = await guild.members.fetch(applicantId).catch(() => null);

            if (customId.startsWith("apply_accept_")) {
                if (applicant) {
                    await applicant.send("🎉 **Congratulazioni!** La tua candidatura Staff su **Elegance Sponsoring** è stata **ACCETTATA**! Un Admin ti contatterà a breve per il periodo di prova.").catch(() => {});
                }

                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor(0x00FF00)
                    .setTitle(`${interaction.message.embeds[0].title} ── 🟢 ACCETTATA`)
                    .setFooter({ text: `Gestita da ${user.username}`, iconURL: user.displayAvatarURL() });

                await interaction.update({ embeds: [updatedEmbed], components: [] });
            } 
            
            else if (customId.startsWith("apply_reject_")) {
                if (applicant) {
                    await applicant.send("❌ **Candidatura Non Accolta:** Ci dispiace, ma la tua candidatura Staff su **Elegance Sponsoring** è stata rifiutata.").catch(() => {});
                }

                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor(0xFF0000)
                    .setTitle(`${interaction.message.embeds[0].title} ── 🔴 RIFIUTATA`)
                    .setFooter({ text: `Gestita da ${user.username}`, iconURL: user.displayAvatarURL() });

                await interaction.update({ embeds: [updatedEmbed], components: [] });
            }
        }
    },

    // Gestore dell'Invio del Form Compilato
    async modalHandler(interaction) {
        const { customId, guild, user } = interaction;

        if (customId === "apply_form_modal") {
            const ans1 = interaction.fields.getTextInputValue("apply_q1");
            const ans2 = interaction.fields.getTextInputValue("apply_q2");
            const ans3 = interaction.fields.getTextInputValue("apply_q3");
            const ans4 = interaction.fields.getTextInputValue("apply_q4");

            const targetChanId = applyConfig.targetChannel || guild.systemChannelId;
            const targetChannel = guild.channels.cache.get(targetChanId);

            if (!targetChannel) {
                return interaction.reply({
                    content: "❌ **Errore:** Il canale di destinazione delle candidature non è stato impostato dallo Staff (Usa `/apply panel`).",
                    flags: MessageFlags.Ephemeral
                });
            }

            const resultEmbed = new EmbedBuilder()
                .setTitle(`📩 NUOVA CANDIDATURA STAFF ── ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor(0x00FF99)
                .setDescription(
                    `**Candidato:** ${user} (\`${user.tag}\`)\n` +
                    `**ID Utente:** \`${user.id}\`\n\n` +
                    "────────────────────────────────────────"
                )
                .addFields(
                    { name: "📌 1. Età e Disponibilità", value: ans1 },
                    { name: "📌 2. Esperienze Pregresse", value: ans2 },
                    { name: "📌 3. Motivazione", value: ans3 },
                    { name: "📌 4. Gestione Conflitti / Troll", value: ans4 }
                )
                .setFooter({ text: "Elegance Sponsoring • Modulo Ricevuto" })
                .setTimestamp();

            // Bottoni di risposta rapida per lo Staff!
            const staffActionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`apply_accept_${user.id}`)
                    .setLabel("🟢 Accetta Candidate")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`apply_reject_${user.id}`)
                    .setLabel("🔴 Rifiuta Candidate")
                    .setStyle(ButtonStyle.Danger)
            );

            await targetChannel.send({ embeds: [resultEmbed], components: [staffActionRow] });

            return interaction.reply({
                content: "✅ **Candidatura Inviata con Successo!** L'Amministrazione valuterà il tuo modulo al più presto.",
                flags: MessageFlags.Ephemeral
            });
        }
    },

    // Helper aggiornamento pannello
    async updatePanelMessage(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── CONFIGURAZIONE CANDIDATURE")
            .setDescription(
                "Configurazione aggiornata con successo!\n\n" +
                `📌 **Canale Ricezione Moduli:** ${applyConfig.targetChannel ? `<#${applyConfig.targetChannel}>` : "`Non impostato (Usa canale corrente)`"}\n` +
                `• **Stato Candidature:** ${applyConfig.enabled ? "🟢 Aperte" : "🔴 Chiuse"}`
            )
            .setColor(0x00FF99);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("apply_toggle")
                .setLabel(applyConfig.enabled ? "Chiudi Candidature" : "Apri Candidature")
                .setStyle(applyConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("apply_set_channel")
                .setLabel("📌 Imposta Canale Ricezione")
                .setStyle(ButtonStyle.Primary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
    }
};
