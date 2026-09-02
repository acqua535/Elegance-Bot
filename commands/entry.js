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

const { Setup } = require("./Setup");

const STAFF_ROLE_ID = "1528576014446231683";

// Helper salvataggio MongoDB con Logging
const saveEntrySetup = async (guildId, data) => {
    try {
        console.log(`[ENTRY SYSTEM] 💾 Salvataggio dati per guild ${guildId}:`, data);
        const result = await Setup.findOneAndUpdate(
            { guildId },
            { $set: data },
            { upsert: true, new: true }
        );
        console.log(`[ENTRY SYSTEM] ✅ Salvataggio DB riuscito!`);
        return result;
    } catch (e) {
        console.error(`[ENTRY SYSTEM ❌ ERRORE] Impossibile salvare DB per guild ${guildId}:`, e);
        return null;
    }
};

// Helper lettura MongoDB con Logging
const getGuildEntryConfig = async (guildId) => {
    if (!guildId) return { welcomeChannel: null, leaveChannel: null, welcomeEnabled: true, leaveEnabled: true };
    try {
        console.log(`[ENTRY SYSTEM] 🔍 Lettura configurazione per guild ${guildId}...`);
        let setup = await Setup.findOne({ guildId });
        
        if (!setup) {
            console.log(`[ENTRY SYSTEM] ⚠️ Documento non trovato. Ne creo uno nuovo.`);
            setup = await Setup.create({ guildId, welcomeEnabled: true, leaveEnabled: true });
        }
        
        console.log(`[ENTRY SYSTEM] ✅ Dati letti con successo.`);
        return {
            welcomeChannel: setup.welcomeChannel || null,
            leaveChannel: setup.leaveChannel || null,
            welcomeEnabled: setup.welcomeEnabled ?? true,
            leaveEnabled: setup.leaveEnabled ?? true
        };
    } catch (e) {
        console.error(`[ENTRY SYSTEM ❌ ERRORE] Impossibile leggere DB per guild ${guildId}:`, e);
        return { welcomeChannel: null, leaveChannel: null, welcomeEnabled: true, leaveEnabled: true };
    }
};

// Generatore Pannello Centralizzato
const sendPanel = async (interaction, config, isInitial) => {
    const embed = new EmbedBuilder()
        .setTitle("⚙️ ELEGANCE SPONSORING - PANNELLO ENTRY")
        .setDescription(
            "Da questo pannello puoi gestire e configurare il sistema di **Benvenuto** e **Addio** per il server.\n\n" +
            `📌 **Canale Benvenuto:** ${config.welcomeChannel ? `<#${config.welcomeChannel}>` : "`Da Impostare (Usa Bottone)`"}\n` +
            `📌 **Canale Addio:** ${config.leaveChannel ? `<#${config.leaveChannel}>` : "`Da Impostare (Usa Bottone)`"}\n\n` +
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

    if (isInitial) {
        await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await interaction.update({ embeds: [embed], components: [row] });
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("entry")
        .setDescription("Gestisci i messaggi di Benvenuto e Addio del server")
        .setDefaultMemberPermissions(0),

    async execute(interaction) {
        console.log(`[ENTRY SYSTEM] 📥 Comando eseguito da ${interaction.user.tag}`);
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const config = await getGuildEntryConfig(interaction.guild.id);
        
        await sendPanel(interaction, config, true);
    },

    async buttonHandler(interaction) {
        console.log(`[ENTRY SYSTEM] 🔘 Bottone premuto: ${interaction.customId} da ${interaction.user.tag}`);
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non hai i permessi per usare questi pulsanti.",
                flags: MessageFlags.Ephemeral
            });
        }

        const { customId, channel, guild } = interaction;
        const config = await getGuildEntryConfig(guild.id);
        const updates = {};

        if (customId === "entry_toggle_welcome") {
            updates.welcomeEnabled = !config.welcomeEnabled;
            config.welcomeEnabled = updates.welcomeEnabled;
        } else if (customId === "entry_toggle_leave") {
            updates.leaveEnabled = !config.leaveEnabled;
            config.leaveEnabled = updates.leaveEnabled;
        } else if (customId === "entry_set_channel") {
            updates.welcomeChannel = channel.id;
            updates.leaveChannel = channel.id;
            config.welcomeChannel = channel.id;
            config.leaveChannel = channel.id;
        }

        await saveEntrySetup(guild.id, updates);
        
        await sendPanel(interaction, config, false);
    },

    initEvents(client) {
        client.on("guildMemberAdd", async (member) => {
            console.log(`[ENTRY SYSTEM] 👤 Trigger Benvenuto: Entrato ${member.user.tag}`);
            if (member.user.bot) return;

            // --- INVIO CARTA "GET OUT OF JAIL FREE" IN DM ---
            try {
                const dmWelcomeEmbed = new EmbedBuilder()
                    .setTitle("🎉 Benvenuto su Elegance Sponsoring!")
                    .setDescription(
                        `Ciao ${member.user.username}, grazie per esserti unito alla nostra community!\n\n` +
                        `🎁 **IL TUO REGALO DI BENVENUTO**\n` +
                        `Come nuovo membro, ti è stata assegnata una speciale **"Get Out of Jail Free" Card**.\n\n` +
                        `🚨 **A cosa serve?**\n` +
                        `Se in futuro dovessi ricevere un provvedimento minore (come un **Timeout**), potrai premere il pulsante qui sotto per **annullarlo istantaneamente**.\n\n` +
                        `⚠️ *Nota bene: Questa carta ha un cooldown di 24 ore dopo ogni utilizzo e non funziona sui Ban.*`
                    )
                    .setColor(0x00C8FF)
                    .setThumbnail(member.guild.iconURL({ dynamic: true }) || member.user.displayAvatarURL())
                    .setFooter({ text: "Elegance Sponsoring • Conserva questo messaggio!" })
                    .setTimestamp();

                const jailButtonRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('use_jail_card')
                        .setLabel('Usa Carta "Get Out of Jail"')
                        .setEmoji('🃏')
                        .setStyle(ButtonStyle.Danger)
                );

                await member.send({ embeds: [dmWelcomeEmbed], components: [jailButtonRow] });
                console.log(`[ENTRY SYSTEM] 📩 DM "Get Out of Jail" inviato con successo a ${member.user.tag}`);
            } catch (dmErr) {
                console.log(`[ENTRY SYSTEM] ⚠️ Impossibile inviare DM a ${member.user.tag} (Messaggi privati chiusi o bloccati).`);
            }

            // --- MESSAGGIO DI BENVENUTO SUL CANALE PUBBLICO ---
            try {
                const config = await getGuildEntryConfig(member.guild.id);
                if (!config.welcomeEnabled) return console.log(`[ENTRY SYSTEM] 🛑 Sistema Benvenuto spento, ignoro.`);

                const channelId = config.welcomeChannel || member.guild.systemChannelId;
                if (!channelId) return console.log(`[ENTRY SYSTEM] ⚠️ Nessun canale impostato.`);

                const channel = member.guild.channels.cache.get(channelId);
                if (!channel) return console.log(`[ENTRY SYSTEM] ⚠️ Canale ${channelId} non in cache.`);

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
                console.log(`[ENTRY SYSTEM] ✅ Benvenuto inviato!`);
            } catch (e) {
                console.error("[ENTRY SYSTEM ❌ ERRORE] guildMemberAdd:", e);
            }
        });

        client.on("guildMemberRemove", async (member) => {
            console.log(`[ENTRY SYSTEM] 👤 Trigger Addio: Uscito ${member.user.tag}`);
            try {
                const config = await getGuildEntryConfig(member.guild.id);
                if (!config.leaveEnabled) return console.log(`[ENTRY SYSTEM] 🛑 Sistema Addio spento, ignoro.`);

                const channelId = config.leaveChannel || member.guild.systemChannelId;
                if (!channelId) return;

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
                console.log(`[ENTRY SYSTEM] ✅ Addio inviato!`);
            } catch (e) {
                console.error("[ENTRY SYSTEM ❌ ERRORE] guildMemberRemove:", e);
            }
        });
    }
};
               
