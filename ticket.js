const { 
    SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, 
    ChannelType, EmbedBuilder, PermissionFlagsBits 
} = require("discord.js");

const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcript");

const LOG_CHANNEL_ID = "1528576197741772902";
const TICKET_CATEGORY_ID = "1528582447443345560";
const TICKET_STAFF_ROLES = ["1528576030783176835"];

// LOGICA ORARI AUTOMATIZZATA
function getOrariInfo() {
    const now = new Date();
    const ora = now.getHours();
    const giorno = now.getDay(); // 0 = Dom, 1 = Lun, ... 6 = Sab
    const mese = now.getMonth(); // 0 = Gen, ... 5 = Giu, 8 = Set

    // Periodo Estivo: Giugno (5) a Settembre (8)
    const isEstate = (mese >= 5 && mese <= 8);
    const orarioChiusura = isEstate ? "00:00" : "21:00";

    if (giorno === 1) return "🔴 **Chiuso** (Siamo chiusi ogni Lunedì)";
    if (ora < 14) return "🔴 **Chiuso** (Apriamo alle 14:00)";
    return `🟢 **Aperto** (Fino alle ${orarioChiusura})`;
}

module.exports = {
    data: new SlashCommandBuilder().setName("ticket").setDescription("Apri un ticket"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("🎫 ELEGANCE | CENTRO SUPPORTO")
            .setDescription(
                "Il sistema di ticket permette di parlare direttamente con lo staff per chiarimenti, " +
                "segnalazioni o assistenza tecnica.\n\n" +
                "**CATEGORIE DISPONIBILI:**\n" +
                "1️⃣ **SUPPORTO** ➡️ Problemi, bug o info generali.\n" +
                "2️⃣ **PARTNERSHIP** ➡️ Proposte di collaborazione.\n" +
                "3️⃣ **HIGH STAFF** ➡️  Questioni amministrative.\n" +
                "4️⃣ **REPORT UTENTE** ➡️ Segnala comportamenti scorretti.\n\n" +
                "⚠️ **STATO & REGOLE:**\n" +
                `Stato: ${getOrariInfo()}\n` +
                "• Estivo/Festivi: 14:00 - 00:00\n" +
                "• Scolastico: 14:00 - 21:00\n\n" +
                "🚫 *Richieste di fusioni o bot comporteranno un warn.*\n" +
                "⚠️ *Ticket inutili o ghosting comportano un warn (24h).* "
            );

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("🎫 Seleziona una categoria...")
            .addOptions([
                { label: "Supporto", value: "support", emoji: "1️⃣" },
                { label: "Partnership", value: "partner", emoji: "2️⃣" },
                { label: "High Staff", value: "staff", emoji: "3️⃣" },
                { label: "Report Utente", value: "report", emoji: "4️⃣" }
            ]);

        await interaction.reply({ 
            embeds: [embed], 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });
    },

    // ... (Mantieni il tuo categoryHandler e buttonHandler esistenti qui sotto)
    async categoryHandler(interaction) {
        // ... tua logica di creazione canale ...
    },

    async buttonHandler(interaction) {
        // ... tua logica di gestione ...
    },

    async router(interaction) {
        interaction.customId = interaction.values[0];
        return this.buttonHandler(interaction);
    }
};
