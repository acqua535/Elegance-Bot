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
const mongoose = require("mongoose");

const STAFF_ROLE_ID = "1528576014446231683";
const LOG_CHANNEL_ID = "1545430782489661470";

// Helper salvataggio MongoDB
const saveEntrySetup = async (guildId, data) => {
    try {
        const result = await Setup.findOneAndUpdate(
            { guildId },
            { $set: data },
            { upsert: true, new: true }
        );
        return result;
    } catch (e) {
        console.error(`[ENTRY SYSTEM ❌ ERRORE] Impossibile salvare DB:`, e);
        return null;
    }
};

// Helper lettura MongoDB
const getGuildEntryConfig = async (guildId) => {
    if (!guildId) return { welcomeChannel: null, leaveChannel: null, welcomeEnabled: true, leaveEnabled: true };
    try {
        let setup = await Setup.findOne({ guildId });
        if (!setup) {
            setup = await Setup.create({ guildId, welcomeEnabled: true, leaveEnabled: true });
        }
        return {
            welcomeChannel: setup.welcomeChannel || setup.welcomeChannelId || null,
            leaveChannel: setup.leaveChannel || setup.leaveChannelId || null,
            welcomeEnabled: setup.welcomeEnabled ?? true,
            leaveEnabled: setup.leaveEnabled ?? true
        };
    } catch (e) {
        console.error(`[ENTRY SYSTEM ❌ ERRORE] Impossibile leggere DB:`, e);
        return { welcomeChannel: null, leaveChannel: null, welcomeEnabled: true, leaveEnabled: true };
    }
};

// Pannello di configurazione Entry
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
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const config = await getGuildEntryConfig(interaction.guild.id);
        await sendPanel(interaction, config, true);
    },

    async buttonHandler(interaction) {
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

    // --- RICHIESTA RISCATTO CARTA (DA DM UTENTE) ---
    async handleJailCard(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const guild = interaction.client.guilds.cache.first();
            if (!guild) {
                return interaction.editReply({ content: "❌ Impossibile individuare il server di riferimento." });
            }

            const member = await guild.members.fetch(interaction.user.id).catch(() => null);
            if (!member) {
                return interaction.editReply({ content: "❌ Non risulti all'interno del server." });
            }

            // Notifica l'utente che la richiesta è stata inoltrata allo Staff
            const userEmbed = new EmbedBuilder()
                .setTitle("🃏 RICHIESTA RISCATTO INVIATA!")
                .setDescription(
                    `Ciao **${interaction.user.username}**, la tua richiesta di utilizzo della **"Get Out of Jail Free" Card** è stata inoltrata allo **Staff**!\n\n` +
                    `📑 Un membro dello staff analizzerà la tua situazione (Timeout/Warn) e ti risponderà o ti contatterà a breve in DM.`
                )
                .setColor(0x00FF99)
                .setTimestamp();

            await interaction.editReply({ embeds: [userEmbed] });

            // Invia notifica nel canale Staff Log con il bottone per l'azione Staff
            const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("🃏 RICHIESTA UTILIZZO CARTA JAIL")
                    .setDescription(
                        `L'utente ${member} (**${member.user.tag}**) ha inviato una richiesta di riscatto carta!\n\n` +
                        `👤 **Membro:** <@${member.id}> (ID: \`${member.id}\`)\n` +
                        `⏰ **Data/Ora:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                        `*Un membro dello Staff può cliccare il bottone sottostante per valutare ed eseguire l'annullamento della sanzione.*`
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
            await interaction.editReply({ content: "❌ Errore durante l'invio della richiesta." });
        }
    },

    // --- AZIONE STAFF (QUANDO LO STAFFER CLICCA SUL BOTTONE NEL CANALE LOG) ---
    async handleStaffJailApprove(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({ content: "❌ Solo lo Staff autorizzato può approvare questa carta.", flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const targetUserId = interaction.customId.replace("staff_approve_jail_", "");
        const guild = interaction.guild;
        const targetMember = await guild.members.fetch(targetUserId).catch(() => null);

        if (!targetMember) {
            return interaction.editReply({ content: "❌ Utente non trovato nel server." });
        }

        let actionTaken = "";

        // 1. Rimuove il Timeout se attivo
        if (targetMember.communicationDisabledUntil && targetMember.communicationDisabledUntil > new Date()) {
            await targetMember.timeout(null, `Carta Jail approvata da ${interaction.user.tag}`);
            actionTaken = "Timeout rimosso";
        } else {
            // 2. Rimuove l'ultimo warn dal database se non ha un timeout
            const db = mongoose.connection.db;
            const warnsCollection = db ? db.collection("warns") : null;
            let removedWarn = false;

            if (warnsCollection) {
                const userWarns = await warnsCollection.find({ guildId: guild.id, userId: targetMember.id }).toArray();
                if (userWarns.length > 0) {
                    const lastWarn = userWarns[userWarns.length - 1];
                    await warnsCollection.deleteOne({ _id: lastWarn._id });
                    removedWarn = true;
                    actionTaken = "Ultimo Warn rimosso dal DB";
                }
            }

            if (!removedWarn) {
                actionTaken = "Nessun Timeout/Warn attivo trovato (Verifica manuale completata)";
            }
        }

        // Notifica DM all'utente dell'avvenuta approvazione
        try {
            await targetMember.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🎉 CARTA JAIL APPROVATA!")
                        .setDescription(`Lo Staffer **${interaction.user.username}** ha approvato la tua richiesta!\n\n📌 **Esito:** ${actionTaken}`)
                        .setColor(0x00FF99)
                        .setTimestamp()
                ]
            });
        } catch (dmErr) {
            console.log(`[JAIL CARD] Impossibile inviare DM di conferma a ${targetMember.user.tag}`);
        }

        // Disabilita il bottone nello staff log per evitare doppio clic
        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("disabled_jail")
                .setLabel(`Approvato da ${interaction.user.username}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

        await interaction.message.edit({ components: [disabledRow] });

        await interaction.editReply({
            content: `✅ Riscatto approvato con successo per ${targetMember}! **Esito:** ${actionTaken}`
        });
    },

    initEvents(client) {
        // Listener per il benvenuto
        client.on("guildMemberAdd", async (member) => {
            if (member.user.bot) return;

            try {
                const dmWelcomeEmbed = new EmbedBuilder()
                    .setTitle("🎉 Benvenuto su Elegance Sponsoring!")
                    .setDescription(
                        `Ciao ${member.user.username}, grazie per esserti unito alla nostra community!\n\n` +
                        `🎁 **IL TUO REGALO DI BENVENUTO**\n` +
                        `Hai ricevuto una **"Get Out of Jail Free" Card**.\n\n` +
                        `🚨 **A cosa serve?**\n` +
                        `Se ricevi un **Timeout** o un **Warn**, premi il pulsante qui sotto: invierai una segnalazione allo Staff per richiedere la revoca della sanzione!`
                    )
                    .setColor(0x00C8FF)
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
            } catch (dmErr) {}

            try {
                const config = await getGuildEntryConfig(member.guild.id);
                if (!config.welcomeEnabled) return;

                const channelId = config.welcomeChannel || member.guild.systemChannelId;
                if (!channelId) return;

                const channel = await member.guild.channels.fetch(channelId).catch(() => null);
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setTitle("👋 ELEGANCE SPONSORING - BENVENUTO/A!")
                    .setDescription(`Benvenuto/a ${member} all'interno della nostra community ufficiale!`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setColor(0x00FF99)
                    .setTimestamp();

                await channel.send({ content: `👋 Benvenuto/a ${member}!`, embeds: [embed] });
            } catch (e) {}
        });

        client.on("guildMemberRemove", async (member) => {
            try {
                const config = await getGuildEntryConfig(member.guild.id);
                if (!config.leaveEnabled) return;

                const channelId = config.leaveChannel || member.guild.systemChannelId;
                if (!channelId) return;

                const channel = await member.guild.channels.fetch(channelId).catch(() => null);
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setTitle("⚙️ ELEGANCE SPONSORING - ARRIVEDERCI")
                    .setDescription(`L'utente **${member.user.tag}** ha lasciato la community.`)
                    .setColor(0xFF0055)
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
            } catch (e) {}
        });
    }
};
            
