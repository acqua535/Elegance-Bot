const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags,
    Collection
} = require("discord.js");

const STAFF_ROLE_ID = "1528576014446231683";

const guildInvites = new Map();
const userInviteStats = new Map();

const invitesConfig = {
    logChannel: null,
    enabled: true
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invites")
        .setDescription("Apre il pannello di controllo della gestione inviti"),

    // Esponiamo le statistiche per essere usate da invites-info.js
    userInviteStats,

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO INVITI")
            .setDescription(
                "Da questo pannello puoi attivare/disattivare il log degli inviti e impostare il canale di notifica.\n\n" +
                `📌 **Canale Log Inviti:** ${invitesConfig.logChannel ? `<#${invitesConfig.logChannel}>` : "`Non impostato (Usa canale corrente)`"}\n` +
                `• **Stato Tracciamento:** ${invitesConfig.enabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • System Control" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("invites_toggle")
                .setLabel(invitesConfig.enabled ? "Disattiva Log" : "Attiva Log")
                .setStyle(invitesConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("invites_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    },

    async buttonHandler(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non hai i permessi per usare questi pulsanti.",
                flags: MessageFlags.Ephemeral
            });
        }

        const { customId, channel } = interaction;

        if (customId === "invites_toggle") {
            invitesConfig.enabled = !invitesConfig.enabled;
        } else if (customId === "invites_set_channel") {
            invitesConfig.logChannel = channel.id;
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO INVITI")
            .setDescription(
                "Configurazione aggiornata con successo!\n\n" +
                `📌 **Canale Log Inviti:** <#${invitesConfig.logChannel || channel.id}>\n` +
                `• **Stato Tracciamento:** ${invitesConfig.enabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("invites_toggle")
                .setLabel(invitesConfig.enabled ? "Disattiva Log" : "Attiva Log")
                .setStyle(invitesConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("invites_set_channel")
                .setLabel("📌 Imposta Canale Corrente")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ embeds: [embed], components: [row] });
    },

    async initInvites(guild) {
        try {
            const fetches = await guild.invites.fetch();
            const codeUses = new Collection();
            fetches.each(inv => codeUses.set(inv.code, inv.uses));
            guildInvites.set(guild.id, codeUses);
        } catch (err) {
            console.error(`Impossibile caricare gli inviti per il server ${guild.id}:`, err);
        }
    },

    async handleMemberAdd(member) {
        if (!invitesConfig.enabled) return;

        const { guild } = member;
        const cachedInvites = guildInvites.get(guild.id) || new Collection();
        
        let inviter = null;
        let usedCode = null;

        try {
            const newInvites = await guild.invites.fetch();
            const usedInvite = newInvites.find(inv => (cachedInvites.get(inv.code) || 0) < inv.uses);

            if (usedInvite) {
                inviter = usedInvite.inviter;
                usedCode = usedInvite.code;
            }

            const updatedCache = new Collection();
            newInvites.each(inv => updatedCache.set(inv.code, inv.uses));
            guildInvites.set(guild.id, updatedCache);

        } catch (error) {
            console.error("Errore nel tracciamento invito:", error);
        }

        const channelId = invitesConfig.logChannel || guild.systemChannelId;
        const channel = guild.channels.cache.get(channelId);
        if (!channel) return;

        let statsText = "Sconosciuto / Link Vanity / Bot";
        if (inviter) {
            const stats = userInviteStats.get(inviter.id) || { total: 0, left: 0, fake: 0 };
            stats.total += 1;
            userInviteStats.set(inviter.id, stats);
            
            const real = stats.total - stats.left - stats.fake;
            statsText = `Invitato da **${inviter.tag}** (Codice: \`${usedCode}\`)\n✉️ **${inviter.username}** ha ora **${real}** inviti!`;
        }

        const embed = new EmbedBuilder()
            .setTitle("📩 TRACCIAMENTO INVITO ── ENTRATA")
            .setDescription(
                `L'utente ${member} (\`${member.user.tag}\`) è entrato nel server!\n\n` +
                "────────────────────────────────────────\n\n" +
                `📌 **Dettagli Invito:**\n${statsText}`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • Invite Tracker" })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    },

    async handleMemberRemove(member) {
        // Logica per aggiornare inviti uscite se necessario
    }
};
