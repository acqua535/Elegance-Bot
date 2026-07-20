const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");
const { EmbedBuilder } = require("discord.js");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_STAFF_ROLES = ["1528576030783176835"];

module.exports = async (interaction) => {
    // 1. Risposta immediata per evitare l'errore "Interazione non riuscita"
    await interaction.deferReply({ ephemeral: true });

    const action = interaction.values ? interaction.values[0] : interaction.customId;
    const ticketData = ticketSystem.getTicketByChannel(interaction.channel.id);

    // Se non è un ticket, gestisci altri bottoni qui (es: verifica)
    if (!ticketData && action !== "verify_button") {
        return interaction.editReply({ content: "❌ Dati ticket non trovati o azione non valida." });
    }

    try {
        switch (action) {
            case "claim_ticket":
                await interaction.editReply({ content: `✅ Ticket preso in carico da ${interaction.user}.` });
                break;

            case "ping_staff":
                if (!ticketSystem.canPingStaff(ticketData.owner)) {
                    return interaction.editReply({ content: "❌ Hai già pingato lo staff nelle ultime 24 ore." });
                }
                ticketSystem.useStaffPing(ticketData.owner);
                await interaction.editReply({ content: `🔔 Ping inviato allo staff! <@&${TICKET_STAFF_ROLES[0]}>` });
                break;

            case "close_ticket":
                await interaction.editReply({ content: "🔒 Chiusura in corso..." });
                const file = await transcriptManager.createTranscript(interaction.channel);
                const user = interaction.guild.members.cache.get(ticketData.owner);
                if (user) user.send({ content: "📁 Il tuo transcript:", files: [file] }).catch(() => {});
                ticketSystem.deleteTicket(ticketData.owner);
                setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
                break;

            default:
                await interaction.editReply({ content: "❓ Azione non definita." });
                break;
        }
    } catch (error) {
        console.error("❌ Errore:", error);
        interaction.editReply({ content: "❌ Errore durante l'esecuzione." }).catch(() => {});
    }
};
