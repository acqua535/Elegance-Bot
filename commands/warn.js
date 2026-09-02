const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Warn } = require("./Setup");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Assegna un avvertimento ufficiale ad un utente")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("utente")
                .setDescription("L'utente da ammonire")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Il motivo dettagliato dell'avvertimento")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("utente");
        const reason = interaction.options.getString("motivo");

        if (user.bot) {
            return interaction.reply({
                content: "❌ **Errore:** Non puoi ammonire un bot del server.",
                flags: MessageFlags.Ephemeral
            });
        }

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({
                content: "❌ **Errore:** Impossibile trovare questo utente all'interno del server.",
                flags: MessageFlags.Ephemeral
            });
        }

        let userData = await Warn.findOne({ userId: user.id, guildId: interaction.guild.id });

        if (!userData) {
            userData = new Warn({ userId: user.id, guildId: interaction.guild.id, warnings: [] });
        }

        userData.warnings.push({
            moderator: interaction.user.id,
            reason: reason,
            date: Date.now()
        });

        await userData.save();
        const totalWarns = userData.warnings.length;

        let automaticAction = "Nessuna azione automatica richiesta.";
        let embedColor = "Orange";

        if (totalWarns === 3) {
            try {
                await member.timeout(24 * 60 * 60 * 1000, "Raggiunti 3 avvertimenti (warn)");
                automaticAction = "⏳ **Timeout di 24 ore** applicato automaticamente per aver toccato quota 3 warn.";
                embedColor = "Red";
            } catch (err) {
                automaticAction = "⚠️ *Impossibile applicare il timeout (verifica la gerarchia dei ruoli del bot).*";
            }
        } else if (totalWarns >= 4) {
            try {
                await user.send(`⚠️ **Attenzione:** Sei stato temporaneamente allontanato dal server **${interaction.guild.name}** per aver accumulato **4 avvertimenti** totali.`).catch(() => {});
                await interaction.guild.members.ban(user.id, { reason: "Raggiunti 4 warn - Ban automatico di sicurezza" });
                automaticAction = "🔨 **Ban di 15 giorni** eseguito automaticamente e notificato in privato all'utente.";
                embedColor = "DarkRed";
            } catch (err) {
                automaticAction = "⚠️ *Impossibile bannare l'utente o inviare il messaggio privato (controlla i permessi).*";
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("⚠️ Registrazione Avvertimento (Warn)")
            .setColor(embedColor)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`Un nuovo avvertimento è stato registrato nel database protetto del server.`)
            .addFields(
                { name: "👤 Utente Ammonito", value: `${user} (\`${user.id}\`)`, inline: false },
                { name: "🛡️ Operatore Staff", value: `${interaction.user}`, inline: true },
                { name: "📊 Stato Attuale", value: `\` ${totalWarns} / 3 \` Warn totali`, inline: true },
                { name: "📝 Motivazione", value: `> ${reason}`, inline: false },
                { name: "⚙️ Provvedimento Automatico", value: automaticAction, inline: false }
            )
            .setFooter({ text: "Elegance Sponsoring • Sistema di Sicurezza Integrato", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
            
