// ==========================================
// FILE: pollTime.js (Sostituisce poll-extend.js unendo entrambe le funzioni)
// ==========================================
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { Poll } = require("./Setup");

const ALLOWED_ROLE_ID = "1528576032670482502";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll-time")
        .setDescription("Aggiungi o riduci la durata di un sondaggio attivo")
        .addStringOption(option =>
            option.setName("link")
                .setDescription("Link del messaggio del sondaggio o ID del messaggio")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("azione")
                .setDescription("Vuoi aggiungere o ridurre il tempo?")
                .setRequired(true)
                .addChoices(
                    { name: "Aggiungi tempo (+)", value: "add" },
                    { name: "Riduci tempo (-)", value: "reduce" }
                )
        )
        .addStringOption(option =>
            option.setName("tempo")
                .setDescription("Quantità di tempo")
                .setRequired(true)
                .addChoices(
                    { name: "1 Ora", value: "1h" },
                    { name: "3 Ore", value: "3h" },
                    { name: "6 Ore", value: "6h" },
                    { name: "12 Ore", value: "12h" },
                    { name: "1 Giorno", value: "1d" },
                    { name: "2 Giorni", value: "2d" }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return await interaction.reply({ content: "❌ Non hai i permessi necessari per modificare la durata di questo sondaggio.", ephemeral: true });
        }

        const inputLink = interaction.options.getString("link").trim();
        const actionType = interaction.options.getString("azione");
        const durationStr = interaction.options.getString("tempo");

        let messageId = inputLink;
        const linkRegex = /\/channels\/(\d+)\/(\d+)\/(\d+)/;
        const match = inputLink.match(linkRegex);
        if (match) {
            messageId = match[3];
        }

        const poll = await Poll.findOne({ messageId });
        if (!poll) {
            return await interaction.reply({ content: "❌ Sondaggio non trovato. Controlla il link o l'ID inserito.", ephemeral: true });
        }

        if (poll.ended) {
            return await interaction.reply({ content: "❌ Questo sondaggio è già concluso.", ephemeral: true });
        }

        let msChange = 0;
        const unit = durationStr.slice(-1);
        const value = parseInt(durationStr.slice(0, -1));

        if (unit === "h") msChange = value * 60 * 60 * 1000;
        if (unit === "d") msChange = value * 24 * 60 * 60 * 1000;

        if (actionType === "add") {
            poll.endTime += msChange;
        } else {
            poll.endTime -= msChange;
            if (poll.endTime <= Date.now()) {
                return await interaction.reply({ content: "❌ Non puoi ridurre il tempo oltre il momento attuale, altrimenti il sondaggio scadrebbe subito o risulterebbe nel passato.", ephemeral: true });
            }
        }

        await poll.save();

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
            console.error("Errore nell'aggiornamento grafico del sondaggio modificato:", err);
        }

        const actionText = actionType === "add" ? "estesa di" : "ridotta di";
        return await interaction.reply({ 
            content: `✅ Durata del sondaggio ${actionText} **${durationStr.replace("h", " ore").replace("d", " giorni")}** con successo!`, 
            ephemeral: true 
        });
    }
};
                                    
