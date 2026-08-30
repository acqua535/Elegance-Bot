// ==========================================
// FILE: apply.js (PANNELLO CONFIGURAZIONE + INVIO MESSAGGIO CANDIDATURA)
// ==========================================
const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} = require("discord.js");

const Setup = require("./Setup");

const STAFF_ROLE_ID = "1528576014446231683";

// Helper salvataggio MongoDB per Apply
const saveApplySetup = async (guildId, data) => {
    try {
        const updateData = {};
        if (data.applyChannel !== undefined) updateData.applyChannel = data.applyChannel;
        if (data.applyEnabled !== undefined) updateData.applyEnabled = data.applyEnabled;

        return await Setup.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { upsert: true, new: true }
        );
    } catch (e) {
        console.error("[MONGO ERROR] Errore salvataggio Apply:", e);
        return null;
    }
};

// Helper lettura MongoDB per Apply
const getGuildApplyConfig = async (guildId) => {
    if (!guildId) return { applyChannel: null, applyEnabled: true };
    try {
        let setup = await Setup.findOne({ guildId });
        if (!setup) {
            setup = await Setup.create({ 
                guildId, 
                applyChannel: null, 
                applyEnabled: true 
            });
        }
        return {
            applyChannel: setup.applyChannel || null,
            applyEnabled: setup.applyEnabled ?? true
        };
    } catch (e) {
        console.error("[MONGO ERROR] Errore lettura Apply:", e);
        return { applyChannel: null, applyEnabled: true };
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("apply")
        .setDescription("Gestisci il sistema delle Candidature")
        .addSubcommand(subcommand =>
            subcommand
                .setName("panel")
                .setDescription("Apre il pannello di controllo per configurare canale ricezione e stato")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("send")
                .setDescription("Manda il messaggio pubblico con il bottone per candidarsi")
        ),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire questo comando.",
                flags: MessageFlags.Ephemeral
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const config = await getGuildApplyConfig(guildId);

        // 📌 SUBCOMMAND: /apply panel (Pannello di controllo staff)
        if (subcommand === "panel") {
            const embed = new EmbedBuilder()
                .setTitle("⚙️ ELEGANCE SPONSORING - PANNELLO APPLY")
                .setDescription(
                    "Da questo pannello puoi gestire e configurare il sistema delle **Candidature**.\n\n" +
                    `📌 **Canale Ricezione Risposte:** ${config.applyChannel ? `<#${config.applyChannel}>` : "`Non impostato (Usa canale corrente)`"}\n` +
                    `• **Stato Sistema:** ${config.applyEnabled ? "🟢 Attivo" : "🔴 Disattivato"}`
                )
                .setColor(0x00FF99)
                .setFooter({ text: "Elegance Sponsoring • Apply System Control" })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("apply_toggle")
                    .setLabel(config.applyEnabled ? "Disattiva Apply" : "Attiva Apply")
                    .setStyle(config.applyEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("apply_set_channel")
                    .setLabel("📌 Imposta Canale Corrente")
                    .setStyle(ButtonStyle.Primary)
            );

            return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
        }

        // 📌 SUBCOMMAND: /apply send (Manda il messaggio con il bottone per candidarsi)
        if (subcommand === "send") {
            const embed = new EmbedBuilder()
                .setTitle("📋 CANDIDATURE ELEGANCE SPONSORING")
                .setDescription(
                    "Vuoi entrare a far parte del nostro team?\n\n" +
                    "Clicca il bottone qui sotto per iniziare la procedura di candidatura e inviare le tue risposte allo staff!"
                )
                .setColor(0x00FF99)
                .setFooter({ text: "Elegance Sponsoring • Staff Recruitment" })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("apply_start_button")
                    .setLabel("📝 Candidati Ora")
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({
                content: "✅ Messaggio di candidatura inviato con successo in questo canale!",
                flags: MessageFlags.Ephemeral
            });
        }
    },

    // 🔘 Gestione dei pulsanti del pannello
    async buttonHandler(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non hai i permessi per usare questi pulsanti.",
                flags: MessageFlags.Ephemeral
            });
        }

        const { customId, channel, guild } = interaction;
        let config = await getGuildApplyConfig(guild.id);

        if (customId === "apply_toggle") {
            const newStatus = !config.applyEnabled;
            await saveApplySetup(guild.id, { applyEnabled: newStatus });
            config.applyEnabled = newStatus;
        } else if (customId === "apply_set_channel") {
            await saveApplySetup(guild.id, { applyChannel: channel.id });
            config.applyChannel = channel.id;
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING - PANNELLO APPLY")
            .setDescription(
                "Configurazione delle candidature aggiornata e salvata su MongoDB Cloud!\n\n" +
                `📌 **Canale Ricezione Risposte:** <#${config.applyChannel || channel.id}>\n` +
                `• **Stato Sistema:** ${config.applyEnabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("apply_toggle")
                .setLabel(config.applyEnabled ? "Disattiva Apply" : "Attiva Apply")
                .setStyle(config.applyEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("apply_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ embeds: [embed], components: [row] });
    },

    getGuildApplyConfig,
    saveApplySetup
};
            
