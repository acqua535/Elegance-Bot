// ==========================================
// FILE: entry.js (PARTE 1/2)
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
const mongoose = require("mongoose");

const STAFF_ROLE_ID = "1528576014446231683";
const LOG_CHANNEL_ID = "1545430782489661470";

// --- SCHEMA & MODELLO MONGO DB PER IL COOLDOWN ---
const jailCooldownSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    lastUsed: { type: Date, required: true }
});

const JailCooldown = mongoose.models.JailCooldown || mongoose.model("JailCooldown", jailCooldownSchema);

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
            welcomeChannel: setup.welcomeChannel || setup.welcomeChannelId || null,
            leaveChannel: setup.leaveChannel || setup.leaveChannelId || null,
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
        console.log(`[ENTRY SYSTEM] 🔘 Bottone pannello premuto: ${interaction.customId} da ${interaction.user.tag}`);
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
            updates.welcomeChannelId = channel.id;
            updates.leaveChannel = channel.id;
            updates.leaveChannelId = channel.id;
            config.welcomeChannel = channel.id;
            config.leaveChannel = channel.id;
        }

        await saveEntrySetup(guild.id, updates);
        await sendPanel(interaction, config, false);
    },

    // --- RICHIESTA RISCATTO CARTA (DA DM UTENTE) CON CONTROLLO 24H MONGO DB ---
    async handleJailCard(interaction) {
        console.log(`[JAIL CARD] 🃏 Bottone riscatto premuto da ${interaction.user.tag}`);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const guild = interaction.client.guilds.cache.first();
            if (!guild) {
                return interaction.editReply({
                    content: "❌ Impossibile individuare il server di riferimento. Contatta uno staffer."
                });
            }

            const member = await guild.members.fetch(interaction.user.id).catch(() => null);
            if (!member) {
                return interaction.editReply({
                    content: "❌ Non risulti essere all'interno del server Elegance Sponsoring."
                });
            }

            // 1. VERIFICA COOLDOWN 24 ORE SU MONGODB
            const userId = interaction.user.id;
            const now = new Date();
            const cooldownRecord = await JailCooldown.findOne({ userId });

            if (cooldownRecord) {
                const lastUsed = new Date(cooldownRecord.lastUsed);
                const diffMs = now - lastUsed;
                const hours24Ms = 24 * 60 * 60 * 1000;

                if (diffMs < hours24Ms) {
                    const remainingMs = hours24Ms - diffMs;
                    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
                    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                    const nextAvailableTimestamp = Math.floor((lastUsed.getTime() + hours24Ms) / 1000);

                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle("⏳ CARTA IN COOLDOWN!")
                        .setDescription(
                            `Hai già inviato una richiesta di riscatto per la tua **"Get Out of Jail Free" Card** nelle ultime 24 ore!\n\n` +
                            `⏱️ **Tempo Rimanente:** \`${remainingHours}h ${remainingMinutes}m\`\n` +
                            `📅 **Potrai riutilizzarla:** <t:${nextAvailableTimestamp}:R> (<t:${nextAvailableTimestamp}:F>)`
                        )
                        .setColor(0xFF0055)
                        .setFooter({ text: "Elegance Sponsoring • Cooldown System" })
                        .setTimestamp();

                    return interaction.editReply({ embeds: [cooldownEmbed] });
                }
            }

                    // 2. SALVA / AGGIORNA IL COOLDOWN SU MONGODB
            await JailCooldown.findOneAndUpdate(
                { userId },
                { lastUsed: now },
                { upsert: true, new: true }
            );

            // 3. INVIO RISPOSTA UTENTE ESTESA
            const userSuccessEmbed = new EmbedBuilder()
                .setTitle("🃏 RICHIESTA RISCATTO INVIATA CON SUCCESSO!")
                .setDescription(
                    `Ciao **${interaction.user.username}**, la tua richiesta di utilizzo della **"Get Out of Jail Free" Card** è stata inoltrata con successo allo **Staff di Elegance Sponsoring**!\n\n` +
                    `📌 **Dettagli Procedura:**\n` +
                    `• Un membro dello staff analizzerà lo stato della tua sanzione (Timeout o Warn attivo).\n` +
                    `• Se idoneo, lo Staffer procederà manualmente all'annullamento del provvedimento.\n` +
                    `• Verrai contattato direttamente in DM per gli aggiornamenti.\n\n` +
                    `⚠️ *Ricorda: Hai attivato il cooldown di 24 ore per questa carta.*`
                )
                .setColor(0x00FF99)
                .setFooter({ text: "Elegance Sponsoring • Card System" })
                .setTimestamp();

            await interaction.editReply({ embeds: [userSuccessEmbed] });

            // 4. INVIO NOTIFICA STAFF LOG ESTESA
            const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("🚨 UTILIZZO CARTA JAIL DETECTED")
                    .setDescription(
                        `L'utente ${member} (**${member.user.tag}**) ha richiesto il riscatto della sua carta di libertà!\n\n` +
                        `👤 **Membro:** <@${member.id}> (ID: \`${member.id}\`)\n` +
                        `🔓 **Azione Richiesta:** Annullamento sanzione (Timeout/Warn)\n` +
                        `⏰ **Data/Ora:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                        `*Un membro dello Staff può cliccare sul bottone sottostante per approvare il riscatto e rimuovere la sanzione all'utente.*`
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setColor(0xFFAA00)
                    .setFooter({ text: "Elegance Sponsoring • Staff Control" })
                    .setTimestamp();

                const staffRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`staff_approve_jail_${member.id}`)
                        .setLabel("Applica Riscatto (Rimuovi Sanzione)")
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Success)
                );

                await logChannel.send({ embeds: [logEmbed], components: [staffRow] });
            }

        } catch (error) {
            console.error(`[JAIL CARD ❌ ERRORE]:`, error);
            await interaction.editReply({
                content: "❌ Si è verificato un errore durante l'invio della richiesta."
            });
        }
    },

    // --- AZIONE STAFFER NEL CANALE LOG ---
    async handleStaffJailApprove(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Solo lo Staff autorizzato può approvare le carte Jail.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const targetUserId = interaction.customId.replace("staff_approve_jail_", "");
        const guild = interaction.guild;
        const targetMember = await guild.members.fetch(targetUserId).catch(() => null);

        if (!targetMember) {
            return interaction.editReply({ content: "❌ Utente non trovato all'interno del server." });
        }

        let actionTaken = "";

        // 1. Rimuove il Timeout se attivo
        if (targetMember.communicationDisabledUntil && targetMember.communicationDisabledUntil > new Date()) {
            await targetMember.timeout(null, `Carta Jail approvata da Staffer: ${interaction.user.tag}`);
            actionTaken = "Timeout annullato con successo.";
        } else {
            // 2. Rimuove l'ultimo Warn attivo dal database
            const db = mongoose.connection.db;
            const warnsCollection = db ? db.collection("warns") : null;
            let removedWarn = false;

            if (warnsCollection) {
                const userWarns = await warnsCollection.find({ guildId: guild.id, userId: targetMember.id }).toArray();
                if (userWarns.length > 0) {
                    const lastWarn = userWarns[userWarns.length - 1];
                    await warnsCollection.deleteOne({ _id: lastWarn._id });
                    removedWarn = true;
                    actionTaken = "Ultimo Warn eliminato dal database.";
                }
            }

            if (!removedWarn) {
                actionTaken = "Nessun Timeout o Warn attivo trovato (Verifica manuale effettuata).";
            }
        }

        // Invia notifica di conferma al DM dell'utente
        try {
            const userNotificationEmbed = new EmbedBuilder()
                .setTitle("🎉 CARTA JAIL APPROVATA DALLO STAFF!")
                .setDescription(
                    `Ciao **${targetMember.user.username}**, lo Staffer **${interaction.user.username}** ha preso in carico ed approvato la tua richiesta di riscatto!\n\n` +
                    `✅ **Esito Operazione:** ${actionTaken}\n` +
                    `🏛️ **Server:** ${guild.name}`
                )
                .setColor(0x00FF99)
                .setFooter({ text: "Elegance Sponsoring • System Notice" })
                .setTimestamp();

            await targetMember.send({ embeds: [userNotificationEmbed] });
        } catch (dmErr) {
            console.log(`[JAIL CARD] Impossibile inviare DM di conferma a ${targetMember.user.tag}`);
        }

        // Disabilita il pulsante nello Staff Log
        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("disabled_jail")
                .setLabel(`Approvato da ${interaction.user.username}`)
                .setEmoji("✅")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

        await interaction.message.edit({ components: [disabledRow] });

        await interaction.editReply({
            content: `✅ Richiesta di riscatto approvata per **${targetMember.user.tag}**!\n📌 **Esito:** ${actionTaken}`
        });
    },

    initEvents(client) {
        // --- ASCOLTATORE BENVENUTO COMPLETO ESTESO ---
        client.on("guildMemberAdd", async (member) => {
            console.log(`[ENTRY SYSTEM] 👤 Trigger Benvenuto: Entrato ${member.user.tag}`);
            if (member.user.bot) return;

            // --- INVIO DM CARTA BENVENUTO ---
            try {
                console.log(`[ENTRY SYSTEM] 📩 Tentativo invio DM Jail Card a @${member.user.tag}...`);
                
                const dmWelcomeEmbed = new EmbedBuilder()
                    .setTitle("🎉 Benvenuto su Elegance Sponsoring!")
                    .setDescription(
                        `Ciao ${member.user.username}, grazie per esserti unito alla nostra community!\n\n` +
                        `🎁 **IL TUO REGALO DI BENVENUTO**\n` +
                        `Come nuovo membro, ti è stata assegnata una speciale **"Get Out of Jail Free" Card**.\n\n` +
                        `🚨 **A cosa serve?**\n` +
                        `Se in futuro dovessi ricevere un provvedimento minore (come un **Timeout** o un **Warn**), potrai premere il pulsante qui sotto per inoltrare la richiesta di annullamento allo Staff!\n\n` +
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
                console.log(`[ENTRY SYSTEM] 🚀 DM "Get Out of Jail" inviato con successo a ${member.user.tag}!`);
            } catch (dmErr) {
                console.error(`[ENTRY SYSTEM] ❌ ERRORE DM per @${member.user.tag}: ${dmErr.message}`);
            }

            // --- MESSAGGIO BENVENUTO CANALE PUBBLICO ESTESO ---
            try {
                const config = await getGuildEntryConfig(member.guild.id);
                if (!config.welcomeEnabled) return console.log(`[ENTRY SYSTEM] 🛑 Sistema Benvenuto spento, ignoro.`);

                const channelId = config.welcomeChannel || member.guild.systemChannelId;
                if (!channelId) return console.log(`[ENTRY SYSTEM] ⚠️ Nessun canale impostato.`);

                let channel = member.guild.channels.cache.get(channelId);
                if (!channel) {
                    try {
                        channel = await member.guild.channels.fetch(channelId);
                    } catch (fetchErr) {
                        return console.log(`[ENTRY SYSTEM] ⚠️ Canale ${channelId} non trovato nel server.`);
                    }
                }

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
                console.log(`[ENTRY SYSTEM] ✅ Benvenuto inviato nel canale!`);
            } catch (e) {
                console.error("[ENTRY SYSTEM ❌ ERRORE] guildMemberAdd:", e);
            }
        });

        // --- ASCOLTATORE ADDIO COMPLETO ESTESO ---
        client.on("guildMemberRemove", async (member) => {
            console.log(`[ENTRY SYSTEM] 👤 Trigger Addio: Uscito ${member.user.tag}`);
            try {
                const config = await getGuildEntryConfig(member.guild.id);
                if (!config.leaveEnabled) return console.log(`[ENTRY SYSTEM] 🛑 Sistema Addio spento, ignoro.`);

                const channelId = config.leaveChannel || member.guild.systemChannelId;
                if (!channelId) return;

                let channel = member.guild.channels.cache.get(channelId);
                if (!channel) {
                    try {
                        channel = await member.guild.channels.fetch(channelId);
                    } catch (fetchErr) {
                        return;
                    }
                }

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
