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
const EXTRA_PING_ROLE = "1528576037150003270"; // Assegnato se ha almeno un ping

// --- 3. PASSIONS ZONE ---
const PASSION_ROLES = {
    "passion_gamer":    { id: "1528576065734443079", label: "🎮 Gamer" },
    "passion_anime":    { id: "1528576066585759816", label: "🎬 Anime & Series" },
    "passion_music":    { id: "1528576067445587968", label: "🎧 Music Lover" },
    "passion_creative": { id: "1528576068351426651", label: "🎨 Creative & Art" }
};
const ALL_PASSION_IDS = Object.values(PASSION_ROLES).map(r => r.id);
const EXTRA_PASSION_ROLE = "1528576064014778381"; // Assegnato se ha almeno una passione

// --- 4. COLOR ZONE ---
const COLOR_ROLES = {
    "color_red":       { id: "1528576043059908609", label: "Red Vibe", emoji: "🔴" },
    "color_gold":      { id: "1528576045236617246", label: "Gold Light", emoji: "🟡" },
    "color_tangerine": { id: "1528576043999559734", label: "Tangerine", emoji: "🟠" },
    "color_emerald":   { id: "1528576049376526427", label: "Emerald", emoji: "🟢" },
    "color_cyan":      { id: "1528576051758759988", label: "Cyan Blue", emoji: "🔵" },
    "color_turquoise": { id: "1528576057735647243", label: "Turquoise", emoji: "💎" },
    "color_pastel":    { id: "1528576056838062190", label: "Pastel Pink", emoji: "🌸" },
    "color_purple":    { id: "1528576053050609757", label: "Purple Royal", emoji: "🟣" },
    "color_white":     { id: "1528576055575838841", label: "Pure White", emoji: "⚪" },
    "color_platinum":  { id: "1528576059555971332", label: "Platinum", emoji: "🩶" },
    "color_chocolate": { id: "1528576053902049301", label: "Chocolate", emoji: "🟤" },
    "color_onyx":      { id: "1528576054703296694", label: "Onyx Black", emoji: "🖤" }
};
const ALL_COLOR_IDS = Object.values(COLOR_ROLES).map(r => r.id);
const EXTRA_COLOR_ROLE = "1528576042204270682"; // Assegnato quando viene scelto un colore

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
                "🎨 **PASSIONS ZONE**\n" +
                "🌈 **COLOR ZONE**"
            )
            .setColor(0x2B2D31)
            .setFooter({ text: "Elegance Sponsoring • Role System" });

        // Menu 1: Age Zone (Singolo)
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

        // Menu 2: Pings Zone (Multiplo)
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

        // Menu 3: Passions Zone (Multiplo)
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

        // Menu 4: Color Zone (Singolo)
        const colorMenuOptions = [
            { label: "Togli il colore", value: "color_reset", description: "Rimuove il colore del nome", emoji: "❌" },
            ...Object.keys(COLOR_ROLES).map(k => ({
                label: COLOR_ROLES[k].label,
                value: k,
                emoji: COLOR_ROLES[k].emoji
            }))
        ];

        const colorMenu = new StringSelectMenuBuilder()
            .setCustomId("select_color_zone")
            .setPlaceholder("🌈 Selezione Colore Nome...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(colorMenuOptions);

        const row1 = new ActionRowBuilder().addComponents(ageMenu);
        const row2 = new ActionRowBuilder().addComponents(pingMenu);
        const row3 = new ActionRowBuilder().addComponents(passionMenu);
        const row4 = new ActionRowBuilder().addComponents(colorMenu);

        await interaction.channel.send({ 
            embeds: [embed], 
            components: [row1, row2, row3, row4] 
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

                await member.roles.remove(AGE_ROLES).catch(() => {});

                if (selectedValue === "age_reset") {
                    await member.roles.remove(EXTRA_AGE_ROLE).catch(() => {});
                    return await interaction.editReply({ content: "🗑️ **Ruolo Età rimosso!**" });
                }

                await member.roles.add([selectedValue, EXTRA_AGE_ROLE]);
                return await interaction.editReply({ content: `✅ **Ruolo <@&${selectedValue}> assegnato!**` });
            }

            // --- GESTIONE PINGS ZONE ---
            if (customId === "select_ping_zone") {
                const selectedKeys = interaction.values;

                await member.roles.remove([...ALL_PING_IDS, EXTRA_PING_ROLE]).catch(() => {});

                if (selectedKeys.length === 0) {
                    return await interaction.editReply({ content: "🔕 **Tutti i Pings sono stati rimossi!**" });
                }

                const rolesToAdd = selectedKeys.map(k => PING_ROLES[k]?.id).filter(Boolean);
                rolesToAdd.push(EXTRA_PING_ROLE);
                await member.roles.add(rolesToAdd);

                const labels = selectedKeys.map(k => `• **${PING_ROLES[k].label}**`).join("\n");
                return await interaction.editReply({ content: `✅ **Notifiche aggiornate:**\n${labels}` });
            }

            // --- GESTIONE PASSIONS ZONE ---
            if (customId === "select_passions_zone") {
                const selectedKeys = interaction.values;

                await member.roles.remove([...ALL_PASSION_IDS, EXTRA_PASSION_ROLE]).catch(() => {});

                if (selectedKeys.length === 0) {
                    return await interaction.editReply({ content: "🗑️ **Tutti i ruoli Passioni sono stati rimossi!**" });
                }

                const rolesToAdd = selectedKeys.map(k => PASSION_ROLES[k]?.id).filter(Boolean);
                rolesToAdd.push(EXTRA_PASSION_ROLE);
                await member.roles.add(rolesToAdd);

                const labels = selectedKeys.map(k => `• **${PASSION_ROLES[k].label}**`).join("\n");
                return await interaction.editReply({ content: `✅ **Passioni aggiornate:**\n${labels}` });
            }

            // --- GESTIONE COLOR ZONE ---
            if (customId === "select_color_zone") {
                const selectedValue = interaction.values[0];

                await member.roles.remove([...ALL_COLOR_IDS, EXTRA_COLOR_ROLE]).catch(() => {});

                if (selectedValue === "color_reset") {
                    return await interaction.editReply({ content: "🗑️ **Ruolo Colore rimosso!**" });
                }

                const colorInfo = COLOR_ROLES[selectedValue];
                if (colorInfo) {
                    await member.roles.add([colorInfo.id, EXTRA_COLOR_ROLE]);
                    return await interaction.editReply({ content: `🎨 **Colore <@&${colorInfo.id}> assegnato!**` });
                }
            }

        } catch (error) {
            console.error("🚨 Errore gestione menu ruoli:", error);
            return await interaction.editReply({
                content: "❌ **Impossibile aggiornare i ruoli.** Verifica i permessi e la posizione del ruolo del Bot!"
            }).catch(() => {});
        }
    }
};
                    
