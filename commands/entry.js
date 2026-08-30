// ==========================================
// FILE: entry.js
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

// Helper salvataggio MongoDB per Entry
const saveEntrySetup = async (guildId, data) => {
    try {
        const updateData = {};
        if (data.welcomeChannel !== undefined) updateData.welcomeChannel = data.welcomeChannel;
        if (data.leaveChannel !== undefined) updateData.leaveChannel = data.leaveChannel;
        if (data.welcomeEnabled !== undefined) updateData.welcomeEnabled = data.welcomeEnabled;
        if (data.leaveEnabled !== undefined) updateData.leaveEnabled = data.leaveEnabled;

        return await Setup.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { upsert: true, new: true }
        );
    } catch (e) {
        console.error("[MONGO ERROR] Errore salvataggio Entry:", e);
        return null;
    }
};

// Helper lettura MongoDB per Entry
const getGuildEntryConfig = async (guildId) => {
    if (!guildId) return { welcomeChannel: null, leaveChannel: null, welcomeEnabled: true, leaveEnabled: true };
    try {
        let setup = await Setup.findOne({ guildId });
        if (!setup) {
            setup = await Setup.create({ 
                guildId, 
                welcomeChannel: null, 
                leaveChannel: null, 
                welcomeEnabled: true, 
                leaveEnabled: true 
            });
        }
        return {
            welcomeChannel: setup.welcomeChannel || null,
            leaveChannel: setup.leaveChannel || null,
            welcomeEnabled: setup.welcomeEnabled ?? true,
            leaveEnabled: setup.leaveEnabled ?? true
        };
    } catch (e) {
        console.error("[MONGO ERROR] Errore lettura Entry:", e);
        return { welcomeChannel: null, leaveChannel: null, welcomeEnabled: true, leaveEnabled: true };
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("entry")
        .setDescription("Gestisci i messaggi di Benvenuto e Addio del server"),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = await getGuildEntryConfig(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING - PANNELLO ENTRY")
            .setDescription(
                "Da questo pannello puoi gestire e configurare il sistema di **Benvenuto** e **Addio** per il server.\n\n" +
                `📌 **Canale Benvenuto:** ${config.welcomeChannel ? `<#${config.welcomeChannel}>` : "`Non impostato (Usa canale corrente)`"}\n` +
                `📌 **Canale Addio:** ${config.leaveChannel ? `<#${config.leaveChannel}>` : "`Non impostato (Usa canale corrente)`"}\n\n` +
                `• **Stato Benvenuto:** ${config.welcomeEnabled ? "🟢 Attivo" : "🔴 Disattivato"}\n` +
                `• **Stato Addio:** ${config.leaveEnabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • System Control" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("entry_toggle_welcome")
                .setLabel(config.welcomeEnabled ? "Disattiva Benvenuto" : "Attiva Benvenuto")
                .setStyle(config.welcomeEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("entry_toggle_leave")
                .setLabel(config.leaveEnabled ? "Disattiva Addio" : "Attiva Addio")
                .setStyle(config.leaveEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("entry_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },

    async buttonHandler(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non hai i permessi per usare questi pulsanti.",
                flags: MessageFlags.Ephemeral
            });
        }

        const { customId, channel, guild } = interaction;
        let config = await getGuildEntryConfig(guild.id);

        if (customId === "entry_toggle_welcome") {
            const newStatus = !config.welcomeEnabled;
            await saveEntrySetup(guild.id, { welcomeEnabled: newStatus });
            config.welcomeEnabled = newStatus;
        } else if (customId === "entry_toggle_leave") {
            const newStatus = !config.leaveEnabled;
            await saveEntrySetup(guild.id, { leaveEnabled: newStatus });
            config.leaveEnabled = newStatus;
        } else if (customId === "entry_set_channel") {
            await saveEntrySetup(guild.id, { welcomeChannel: channel.id, leaveChannel: channel.id });
            config.welcomeChannel = channel.id;
            config.leaveChannel = channel.id;
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING - PANNELLO ENTRY")
            .setDescription(
                "Stato della configurazione aggiornato e salvato su MongoDB Cloud!\n\n" +
                `📌 **Canale Impostato:** <#${config.welcomeChannel || channel.id}>\n\n` +
                `• **Stato Benvenuto:** ${config.welcomeEnabled ? "🟢 Attivo" : "🔴 Disattivato"}\n` +
                `• **Stato Addio:** ${config.leaveEnabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("entry_toggle_welcome")
                .setLabel(config.welcomeEnabled ? "Disattiva Benvenuto" : "Attiva Benvenuto")
                .setStyle(config.welcomeEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("entry_toggle_leave")
                .setLabel(config.leaveEnabled ? "Disattiva Addio" : "Attiva Addio")
                .setStyle(config.leaveEnabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("entry_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ embeds: [embed], components: [row] });
    },

    initEvents(client) {
        client.on("guildMemberAdd", async (member) => {
            try {
                const config = await getGuildEntryConfig(member.guild.id);
                if (!config.welcomeEnabled) return;

                const channelId = config.welcomeChannel || member.guild.systemChannelId;
                const channel = member.guild.channels.cache.get(channelId);
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setTitle("👋 ELEGANCE SPONSORING - BENVENUTO/A!")
                    .setDescription(
                        `Benvenuto/a ${member} all'interno della nostra community ufficiale!\n\n` +
                        "**ASPETTI FONDAMENTALI**\n" +
                        "• Leggi il regolamento nel canale dedicato per evitare sanzioni.\n" +
                        "• Completa la verifica per sbloccare tutti i canali del server.\n" +
                        "• Apri un ticket nella sezione supporto se hai bisogno di aiuto.\n\n" +
                        "**INFO MEMBRO**\n" +
                        `• **Account:** ${member.user.tag}\n` +
                        `• **Membro N°:** ${member.guild.memberCount}\n\n` +
                        "Buona permanenza e divertiti con noi!"
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setColor(0x00FF99)
                    .setFooter({ text: "Elegance Sponsoring • Welcome System", iconURL: member.guild.iconURL() })
                    .setTimestamp();

                await channel.send({ content: `👋 Benvenuto/a ${member}!`, embeds: [embed] });
            } catch (e) {
                console.error("[LOG ERROR] guildMemberAdd:", e);
            }
        });

        client.on("guildMemberRemove", async (member) => {
            try {
                const config = await getGuildEntryConfig(member.guild.id);
                if (!config.leaveEnabled) return;

                const channelId = config.leaveChannel || member.guild.systemChannelId;
                const channel = member.guild.channels.cache.get(channelId);
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setTitle("⚙️ ELEGANCE SPONSORING - ARRIVEDERCI")
                    .setDescription(
                        `L'utente **${member.user.tag}** ha lasciato la community.\n\n` +
                        `• Ora siamo in **${member.guild.memberCount}** membri su Elegance Sponsoring.\n` +
                        "• Speriamo di rivederci presto!"
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setColor(0xFF0055)
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
            } catch (e) {
                console.error("[LOG ERROR] guildMemberRemove:", e);
            }
        });
    }
};
                          
