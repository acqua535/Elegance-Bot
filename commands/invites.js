const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags,
    Collection
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const STAFF_ROLE_ID = "1528576014446231683";
const SETUPS_PATH = path.join(__dirname, "setups.json");

const guildInvites = new Map();
const userInviteStats = new Map();

const getSetups = () => {
    if (!fs.existsSync(SETUPS_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(SETUPS_PATH, "utf8"));
    } catch {
        return {};
    }
};

const saveInvitesSetup = (guildId, data) => {
    const setups = getSetups();
    setups[guildId] = {
        ...setups[guildId],
        invitesLogChannel: data.logChannel !== undefined ? data.logChannel : (setups[guildId]?.invitesLogChannel || null),
        invitesEnabled: data.enabled !== undefined ? data.enabled : (setups[guildId]?.invitesEnabled ?? true)
    };
    fs.writeFileSync(SETUPS_PATH, JSON.stringify(setups, null, 4));
};

const getGuildInvitesConfig = (guildId) => {
    const setups = getSetups();
    return {
        logChannel: setups[guildId]?.invitesLogChannel || null,
        enabled: setups[guildId]?.invitesEnabled ?? true
    };
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invites")
        .setDescription("Apre il pannello di controllo della gestione inviti"),

    userInviteStats,

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per gestire questo pannello.",
                flags: MessageFlags.Ephemeral
            });
        }

        const config = getGuildInvitesConfig(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO INVITI")
            .setDescription(
                "Da questo pannello puoi attivare/disattivare il log degli inviti e impostare il canale di notifica.\n\n" +
                `📌 **Canale Log Inviti:** ${config.logChannel ? `<#${config.logChannel}>` : "`Non impostato (Usa canale corrente)`"}\n` +
                `• **Stato Tracciamento:** ${config.enabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99)
            .setFooter({ text: "Elegance Sponsoring • System Control" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("invites_toggle")
                .setLabel(config.enabled ? "Disattiva Log" : "Attiva Log")
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

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

        const { customId, channel, guild } = interaction;
        let config = getGuildInvitesConfig(guild.id);

        if (customId === "invites_toggle") {
            const newStatus = !config.enabled;
            saveInvitesSetup(guild.id, { enabled: newStatus });
            config.enabled = newStatus;
        } else if (customId === "invites_set_channel") {
            saveInvitesSetup(guild.id, { logChannel: channel.id });
            config.logChannel = channel.id;
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ ELEGANCE SPONSORING ── PANNELLO INVITI")
            .setDescription(
                "Configurazione aggiornata con successo!\n\n" +
                `📌 **Canale Log Inviti:** <#${config.logChannel || channel.id}>\n` +
                `• **Stato Tracciamento:** ${config.enabled ? "🟢 Attivo" : "🔴 Disattivato"}`
            )
            .setColor(0x00FF99);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("invites_toggle")
                .setLabel(config.enabled ? "Disattiva Log" : "Attiva Log")
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),

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
        const { guild } = member;
        const config = getGuildInvitesConfig(guild.id);
        if (!config.enabled) return;

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

        const channelId = config.logChannel || guild.systemChannelId;
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
                            
