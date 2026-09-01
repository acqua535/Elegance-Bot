// ==========================================
// FILE: pollExtend.js
// ==========================================
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { Poll } = require("./Setup");

const ALLOWED_ROLE_ID = "1528576032670482502";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll-extend")
        .setDescription("Estendi la durata di un sondaggio attivo inserendo il link del messaggio")
        .addStringOption(option =>
            option.setName("link")
                .setDescription("Link del messaggio del sondaggio o ID del messaggio")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("aggiunta")
                .setDescription("Quanto tempo vuoi aggiungere?")
                .setRequired(true)
                .addChoices(
                    { name: "+1 Ora", value: "1h" },
                    { name: "+3 Ore", value: "3h" },
                    { name: "+6 Ore", value: "6h" },
                    { name: "+12 Ore", value: "12h" },
                    { name: "+1 Giorno", value: "1d" },
                    { name: "+2 Giorni", value: "2d" }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return await interaction.reply({ content: "❌ Non hai i permessi necessari per estendere questo sondaggio.", ephemeral: true });
        }

        const inputLink = interaction.options.getString("link").trim();
        const durationStr = interaction.options.getString("aggiunta");

        // Estrae il messageId dal link standard di Discord o accetta direttamente l'ID puro
        let messageId = inputLink;
        const linkRegex = /\/channels\/(\d+)\/(\d+)\/(\d+)/;
        const match = inputLink.match(linkRegex);
        if (match) {
            messageId = match[3];
        }

        const poll = await Poll.findOne({ messageId });
        if (!poll) {
            return await interaction.reply({ content: "❌ Sondaggio non trovato. Assicurati di aver inserito un link valido o l'ID corretto di un sondaggio registrato nel DB.", ephemeral: true });
        }

        if (poll.ended) {
            return await interaction.reply({ content: "❌ Questo sondaggio è già concluso. Non puoi estenderne la durata.", ephemeral: true });
        }

        // Calcolo dei millisecondi da aggiungere
        let msAdd = 0;
        const unit = durationStr.slice(-1);
        const value = parseInt(durationStr.slice(0, -1));

        if (unit === "h") msAdd = value * 60 * 60 * 1000;
        if (unit === "d") msAdd = value * 24 * 60 * 60 * 1000;

        poll.endTime += msAdd;
        await poll.save();

        // Aggiorna in tempo reale la grafica dell'embed nel canale
        try {
            const channel = await interaction.client.channels.fetch(poll.channelId);
            if (channel) {
                const msg = await channel.messages.fetch(messageId);
                if (msg && msg.embeds.length > 0) {
                    const oldEmbed = msg.embeds[0];
                    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
                    
                    const updatedDesc = `**${poll.question}**\n\n` + 
                        poll.options.map((opt, i) => `${emojis[i]} - ${opt}`).join("\n") + 
                        `\n\n⚙️ **Scelta multipla:** ${poll.isMultiple ? "Sì" : "No"}\n⏳ **Termina tra:** <t:${Math.floor(poll.endTime / 1000)}:R>`;

                    const newEmbed = EmbedBuilder.from(oldEmbed).setDescription(updatedDesc);
                    await msg.edit({ embeds: [newEmbed] });
                }
            }
        } catch (err) {
            console.error("Errore nell'aggiornamento grafico del sondaggio esteso:", err);
        }

        return await interaction.reply({ 
            content: `✅ Durata del sondaggio estesa con successo di **${durationStr.replace("h", " ore").replace("d", " giorni")}**!`, 
            ephemeral: true 
        });
    }
};
