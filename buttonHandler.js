const { EmbedBuilder } = require("discord.js");
const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_STAFF_ROLES = ["1528576030783176835"];

module.exports = async (interaction) => {
    // Recuperiamo l'azione dal valore del menu (o dal customId se fosse un bottone)
    const action = interaction.values ? interaction.values[0] : interaction.customId;
    const ticketData = ticketSystem.getTicketByChannel(interaction.channel.id);

    if (!ticketData) {
        return interaction.reply({ content: "❌ Errore: Dati ticket non trovati.", ephemeral: true });
    }

    try {
        switch (action) {
            case "claim_ticket":
                if (!TICKET_STAFF_ROLES.some(r => interaction.member.roles.cache.has(r))) {
                    return interaction.reply({ content: "❌ Solo lo staff può prendere in carico i ticket.", ephemeral: true });
                }
                await interaction.reply({ content: `✅ Ticket preso in carico da ${interaction.user}.` });
                const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
                if (logChannel) {
                    logChannel.send({ embeds: [new EmbedBuilder().setTitle("✅ TICKET CLAIMED").setDescription(`Staff: ${interaction.user.tag}\nTicket: ${interaction.channel.name}`).setColor("Green")] });
                }
                break;

            case "ping_staff":
                if (!ticketSystem.canPingStaff(ticketData.owner)) {
                    return interaction.reply({ content: "❌ Hai già pingato lo staff nelle ultime 24 ore.", ephemeral: true });
                }
                ticketSystem.useStaffPing(ticketData.owner);
                await interaction.reply({ content: `🔔 Ping inviato allo staff! <@&${TICKET_STAFF_ROLES[0]}>` });
                break;

            case "close_ticket":
                await interaction.reply({ content: "🔒 Chiusura ticket in corso..." });
                
                // Crea il transcript (assumendo che il modulo sia configurato)
                const file = await transcriptManager.createTranscript(interaction.channel);
                
                // Invia transcript all'utente e al log
                const user = interaction.guild.members.cache.get(ticketData.owner);
                if (user) user.send({ content: "📁 Ecco il transcript del tuo ticket:", files: [file] }).catch(() => {});
                
                const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
                if (log) log.send({ content: `📁 **Transcript per:** ${interaction.channel.name}`, files: [file] });

                // Elimina dal sistema e dal server
                ticketSystem.deleteTicket(ticketData.owner);
                setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
                break;

            default:
                await interaction.reply({ content: "❓ Azione non riconosciuta.", ephemeral: true });
                break;
        }
    } catch (error) {
        console.error("❌ Errore in buttonHandler:", error);
        if (!interaction.replied) {
            await interaction.reply({ content: "❌ Si è verificato un errore durante l'esecuzione.", ephemeral: true });
        }
    }
};
