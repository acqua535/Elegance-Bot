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
const EXTRA_AGE_ROLE = "1528576060667723936";

// --- 2. PINGS ZONE ---
const PING_ROLES = {
    "ping_annunci": { id: "1528576038534385704", label: "📢 Announcement Ping" },
    "ping_eventi":  { id: "1528576039633158315", label: "🎉 Event Ping" },
    "ping_partner": { id: "1528576041206022204", label: "🤝 Partner Ping" }
};
const ALL_PING_IDS = Object.values(PING_ROLES).map(r => r.id);

// --- 3. PASSIONS ZONE ---
const PASSION_ROLES = {
    "passion_gamer":    { id: "1528576065734443079", label: "🎮 Gamer" },
    "passion_anime":    { id: "1528576066585759816", label: "🎬 Anime & Series" },
    "passion_music":    { id: "1528576067445587968", label: "🎧 Music Lover" },
    "passion_creative": { id: "1528576068351426651", label: "🎨 Creative & Art" }
};
const ALL_PASSION_IDS = Object.values(PASSION_ROLES).map(r => r.id);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolepanel")
        .setDescription("Invia il pannello per la selezione dei ruoli")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("✨ ELEGANCE SPONSORING ── ROLE SELECTION")
            .setDescription(
                "Personalizza il tuo profilo e le tue notifiche selezionando i ruoli dai menu qui sotto!\n\n" +
                "🔞 **AGE ZONE**\n" +
                "🔔 **PINGS ZONE**\n" +
                "🎨 **PASSIONS ZONE**"
            )
            .setColor(0x2B2D31)
            .setFooter({ text: "Elegance Sponsoring • Role System" });

        // Menu 1: Age Zone (Unico ruolo età consentito)
        const ageMenu = new StringSelectMenuBuilder()
            .setCustomId("select_age_zone")
            .setPlaceholder("🔞 Selezione Età...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                { label: "Togli l'età", value: "age_reset", description: "Rimuove il ruolo età", emoji: "❌" },
                { label: ". 14-17", value: "1528576061963632663", description: "Fascia d'età 14-17 anni", emoji: "📚" },
                { label: ". 18+", value: "1528576063272124476", description: "Fascia d'età 18+ anni", emoji: "🥂" }
            ]);

        // Menu 2: Pings Zone (Selezione Multipla)
        const pingMenu = new StringSelectMenuBuilder()
            .setCustomId("select_ping_zone")
            .setPlaceholder("🔔 Selezione Notifiche & Ping...")
            .setMinValues(0)
            .setMaxValues(Object.keys(PING_ROLES).length)
            .addOptions([
                { label: "Announcement Ping", value: "ping_annunci", description: "Notifiche per gli annunci", emoji: "📢" },
                { label: "Event Ping", value: "ping_eventi", description: "Notifiche per eventi", emoji: "🎉" },
                { label: "Partner Ping", value: "ping_partner", description: "Notifiche per partnership", emoji: "🤝" }
            ]);

        // Menu 3: Passions Zone (Selezione Multipla)
        const passionMenu = new StringSelectMenuBuilder()
            .setCustomId("select_passions_zone")
            .setPlaceholder("🎨 Selezione Passioni...")
            .setMinValues(0)
            .setMaxValues(Object.keys(PASSION_ROLES).length)
            .addOptions([
                { label: "Gamer", value: "passion_gamer", description: "Passione Gaming", emoji: "🎮" },
                { label: "Anime & Series", value: "passion_anime", description: "Passione Anime & Serie TV", emoji: "🎬" },
                { label: "Music Lover", value: "passion_music", description: "Passione Musica", emoji: "🎧" },
                { label: "Creative & Art", value: "passion_creative", description: "Passione Arte & Creatività", emoji: "🎨" }
            ]);

        const row1 = new ActionRowBuilder().addComponents(ageMenu);
        const row2 = new ActionRowBuilder().addComponents(pingMenu);
        const row3 = new ActionRowBuilder().addComponents(passionMenu);

        await interaction.channel.send({ 
            embeds: [embed], 
            components: [row1, row2, row3] 
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

                // Rimuove tassativamente entrambi i ruoli età per evitare sovrapposizioni
                await member.roles.remove(AGE_ROLES).catch(() => {});

                if (selectedValue === "age_reset") {
                    await member.roles.remove(EXTRA_AGE_ROLE).catch(() => {});
                    return await interaction.editReply({ content: "🗑️ **Ruolo Età rimosso!**" });
                }

                // Assegna esclusivamente l'unico ruolo età scelto + il ruolo silenziato
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

            // --- GESTIONE PASSIONS ZONE ---
            if (customId === "select_passions_zone") {
                const selectedKeys = interaction.values;

                await member.roles.remove(ALL_PASSION_IDS).catch(() => {});

                if (selectedKeys.length === 0) {
                    return await interaction.editReply({ content: "🗑️ **Tutti i ruoli Passioni sono stati rimossi!**" });
                }

                const rolesToAdd = selectedKeys.map(k => PASSION_ROLES[k]?.id).filter(Boolean);
                await member.roles.add(rolesToAdd);

                const labels = selectedKeys.map(k => `• **${PASSION_ROLES[k].label}**`).join("\n");
                return await interaction.editReply({ content: `✅ **Passioni aggiornate:**\n${labels}` });
            }

        } catch (error) {
            console.error("🚨 Errore gestione menu ruoli:", error);
            return await interaction.editReply({
                content: "❌ **Impossibile aggiornare i ruoli.** Verifica i permessi e la posizione del ruolo del Bot!"
            }).catch(() => {});
        }
    }
};
