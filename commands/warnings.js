const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { Warn } = require("./Setup");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("Visualizza lo storico dettagliato dei warn di un utente")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("utente")
                .setDescription("L'utente di cui vuoi controllare lo storico")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("utente");
        const userData = await Warn.findOne({ userId: user.id, guildId: interaction.guild.id });

        if (!userData || userData.warnings.length === 0) {
            return interaction.reply({
                embeds: [
                    fed = new EmbedBuilder()
                        .setTitle("🛡️ Registro Sicurezza • Storico Avvertimenti")
                        .setColor("Green")
                        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                        .setDescription(`Ottime notizie! L'utente ${user} ha la fedina penale pulita e **non possiede alcun warn** registrato.`)
                        .setTimestamp()
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        let historyList = "";
        userData.warnings.forEach((warn, index) => {
            const timestampSec = Math.floor(warn.date / 1000);
            historyList += `### Avvertimento n° ${index + 1}\n` +
                           `• **Moderatore:** <@${warn.moderator}>\n` +
                           `• **Motivazione:** ${warn.reason}\n` +
                           `• **Data Registrazione:** <t:${timestampSec}:F> (<t:${timestampSec}:R>)\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`📋 Dossier Warn • ${user.tag}`)
            .setColor(userData.warnings.length >= 3 ? "Red" : "Orange")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`Ecco l'elenco completo e cronologico degli avvertimenti accumulati dall'utente nel server:\n\n${historyList}`)
            .addFields({ name: "📊 Riepilogo Complessivo", value: `L'utente possiede attualmente **${userData.warnings.length}** warn attivi nel database.` })
            .setFooter({ text: `ID Utente: ${user.id}`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
