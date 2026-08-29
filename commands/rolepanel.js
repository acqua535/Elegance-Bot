// ==========================================
// FILE: commands/rolepanel.js
// ==========================================
const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    PermissionFlagsBits, 
    MessageFlags 
} = require("discord.js");

// --- 1. AGE ZONE ---
const AGE_ROLES = [
    "1528576061963632663", // 14-17
    "1528576063272124476"  // 18+
];
const EXTRA_AGE_ROLE = "1528576060667723936"; // Ruolo extra silenziato assegnato con l'età

// --- 2. PINGS ZONE ---
const PING_ROLES = {
    "ping_annunci": { id: "1528576038534385704", label: "📢 Announcement Ping" },
    "ping_eventi":  { id: "1528576039633158315", label: "🎉 Event Ping" },
    "ping_partner": { id: "1528576041206022204", label: "🤝 Partner Ping" }
};
const ALL_PING_IDS = Object.values(PING_ROLES).map(r => r.id);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolepanel")
        .setDescription("Invia il pannello per la selezione dei ruoli")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("✨ ELEGANCE SPONSORING ── ROLE SELECTION")
            .setDescription(
                "Personalizza il tuo profilo e le tue notifiche selezionando i ruoli dai menu a tendina qui sotto!\n\n" +
                "🔞 **1. AGE ZONE** ── Fascia d'età\n" +
                "🔔 **2. PINGS ZONE** ── Notifiche e Ping"
            )
            .setColor(0x2B2D31)
            .setFooter({ text: "Elegance Sponsoring • Role System" });

        // Menu 1: Age Zone
        const ageMenu = new StringSelectMenuBuilder()
            .setCustomId("select_age_zone")
            .setPlaceholder("🔞 1. Selezione Età...")
            .addOptions([
                { label: "Togli l'età", value: "age_reset", description: "Rimuove il ruolo età", emoji: "❌" },
                { label: ". 14-17", value: "1528576061963632663", description: "Fascia d'età 14-17 anni", emoji: "📚" },
                { label: ". 18+", value: "1528576063272124476", description: "Fascia d'età 18+ anni", emoji: "🥂" }
            ]);

        // Menu 2: Pings Zone (Selezione Multipla)
        const pingMenu = new StringSelectMenuBuilder()
            .setCustomId("select_ping_zone")
            .setPlaceholder("🔔 2. Selezione Notifiche & Ping...")
            .setMinValues(0)
            .setMaxValues(Object.keys(PING_ROLES).length)
            .addOptions([
                { label: "Announcement Ping", value: "ping_annunci", description: "Notifiche per gli annunci", emoji: "📢" },
                { label: "Event Ping", value: "ping_eventi", description: "Notifiche per eventi", emoji: "🎉" },
                { label: "Partner Ping", value: "ping_partner", description: "Notifiche per partnership", emoji: "🤝" }
            ]);

        const row1 = new ActionRowBuilder().addComponents(ageMenu);
        const row2 = new ActionRowBuilder().addComponents(pingMenu);

        await interaction.channel.send({ 
            embeds: [embed], 
            components: [row1, row2] 
        });

        return interaction.reply({
            content: "✅ **Pannello Ruoli inviato con successo!**",
            flags: MessageFlags.Ephemeral
        });
    },

    async selectMenuHandler(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

        try {
            const member = interaction.member;
            const customId = interaction.customId;

            // --- GESTIONE AGE ZONE ---
            if (customId === "select_age_zone") {
                const selectedValue = interaction.values[0];

                await member.roles.remove([...AGE_ROLES, EXTRA_AGE_ROLE]).catch(() => {});

                if (selectedValue === "age_reset") {
                    return await interaction.editReply({ content: "🗑️ **Ruolo Età rimosso!**" });
                }

                await member.roles.add([selectedValue, EXTRA_AGE_ROLE]);
                return await interaction.editReply({ content: `✅ **Ruolo <@&${selectedValue}> assegnato!**` });
            }

            // --- GESTIONE PINGS ZONE ---
            if (customId === "select_ping_zone") {
                const selectedKeys = interaction.values;

                await member.roles.remove(ALL_PING_IDS).catch(() => {});

                if (selectedKeys.length === 0) {
                    return await interaction.editReply({ content: "🔕 **Tutti i Pings sono stati rimossi!**" });
                }

                const rolesToAdd = selectedKeys.map(k => PING_ROLES[k]?.id).filter(Boolean);
                await member.roles.add(rolesToAdd);

                const labels = selectedKeys.map(k => `• **${PING_ROLES[k].label}**`).join("\n");
                return await interaction.editReply({ content: `✅ **Notifiche aggiornate:**\n${labels}` });
            }

        } catch (error) {
            console.error("🚨 Errore gestione menu ruoli:", error);
            return await interaction.editReply({
                content: "❌ **Impossibile aggiornare i ruoli.** Verifica i permessi e la posizione del ruolo del Bot!"
            }).catch(() => {});
        }
    }
};
                    
