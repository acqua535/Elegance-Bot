const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { Poll, PollLog } = require("./Setup");

const ALLOWED_ROLE_ID = "1528576032670482502";

async function sendPollLog(client, guildId, embed) {
    try {
        const logConfig = await PollLog.findOne({ guildId });
        if (!logConfig) return;
        const channel = await client.channels.fetch(logConfig.channelId);
        if (channel) {
            await channel.send({ embeds: [embed] });
        }
    } catch (err) {
        console.error("Errore nell'invio del log del sondaggio:", err);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Crea un sondaggio avanzato con durata, scelta multipla e conteggio automatico")
        .addStringOption(option =>
            option.setName("domanda")
                .setDescription("La domanda del sondaggio")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("opzione1")
                .setDescription("Prima opzione")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("opzione2")
                .setDescription("Seconda opzione")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("multipla")
                .setDescription("Permetti di votare più opzioni?")
                .setRequired(true)
                .addChoices(
                    { name: "Sì", value: "yes" },
                    { name: "No", value: "no" }
                )
        )
        .addStringOption(option =>
            option.setName("durata")
                .setDescription("Durata del sondaggio")
                .setRequired(true)
                .addChoices(
                    { name: "1 Ora", value: "1h" },
                    { name: "3 Ore", value: "3h" },
                    { name: "6 Ore", value: "6h" },
                    { name: "12 Ore", value: "12h" },
                    { name: "18 Ore", value: "18h" },
                    { name: "1 Giorno", value: "1d" },
                    { name: "2 Giorni", value: "2d" },
                    { name: "3 Giorni", value: "3d" },
                    { name: "4 Giorni", value: "4d" },
                    { name: "5 Giorni", value: "5d" },
                    { name: "6 Giorni", value: "6d" },
                    { name: "7 Giorni", value: "7d" }
                )
        )
        .addStringOption(option =>
            option.setName("opzione3")
                .setDescription("Terza opzione (opzionale)")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("opzione4")
                .setDescription("Quarta opzione (opzionale)")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return await interaction.reply({
                content: "❌ Non hai i permessi necessari (ruolo Community Support) per utilizzare questo comando.",
                ephemeral: true
            });
        }

        const question = interaction.options.getString("domanda");
        const rawOptions = [
            interaction.options.getString("opzione1"),
            interaction.options.getString("opzione2"),
            interaction.options.getString("opzione3"),
            interaction.options.getString("opzione4")
        ];
        
        const options = rawOptions.filter(Boolean);
        const isMultiple = interaction.options.getString("multipla") === "yes";
        const durationStr = interaction.options.getString("durata");

        let msDuration = 0;
        const unit = durationStr.slice(-1);
        const value = parseInt(durationStr.slice(0, -1));

        if (unit === "h") msDuration = value * 60 * 60 * 1000;
        if (unit === "d") msDuration = value * 24 * 60 * 60 * 1000;

        const endTime = Date.now() + msDuration;
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

        const embed = new EmbedBuilder()
            .setColor("#0099FF")
            .setTitle("📊 Sondaggio")
            .setDescription(`**${question}**\n\n` + options.map((opt, i) => `${emojis[i]} - ${opt}`).join("\n") + `\n\n⚙️ **Scelta multipla:** ${isMultiple ? "Sì" : "No"}\n⏳ **Termina tra:** <t:${Math.floor(endTime / 1000)}:R>`)
            .setFooter({ text: `Creato da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder();
        options.forEach((_, i) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`poll_vote_${i}`)
                    .setLabel(emojis[i])
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const controlRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("poll_close_early")
                .setLabel("Chiudi Anticipatamente")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("poll_voters_info")
                .setLabel("Vedi Partecipanti")
                .setStyle(ButtonStyle.Secondary)
        );

        const message = await interaction.reply({ embeds: [embed], components: [row, controlRow], withResponse: true });
        const replyMessage = message.resource ? message.resource.message : await interaction.fetchReply();

        await Poll.create({
            messageId: replyMessage.id,
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            question,
            options,
            isMultiple,
            endTime,
            votes: new Map(),
            ended: false
        });

        // LOG CREAZIONE SONDAGGIO
        const createLogEmbed = new EmbedBuilder()
            .setColor("#0099FF")
            .setTitle("📝 Log: Sondaggio Creato")
            .addFields(
                { name: "Creatore", value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                { name: "Canale", value: `<#${interaction.channel.id}>`, inline: true },
                { name: "Domanda", value: question },
                { name: "Opzioni", value: options.map((opt, i) => `${emojis[i]} ${opt}`).join("\n") },
                { name: "Scelta Multipla", value: isMultiple ? "Sì" : "No", inline: true },
                { name: "Durata", value: durationStr, inline: true }
            )
            .setTimestamp();
        await sendPollLog(interaction.client, interaction.guild.id, createLogEmbed);

        setTimeout(() => {
            chiudiSondaggio(replyMessage.client, replyMessage.id, "scadenza");
        }, msDuration);
    }
};

async function handlePollInteraction(interaction) {
    const poll = await Poll.findOne({ messageId: interaction.message.id });
    if (!poll) {
        return await interaction.reply({ content: "❌ Questo sondaggio non esiste o è scaduto.", ephemeral: true });
    }

    if (interaction.customId === "poll_close_early") {
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return await interaction.reply({ content: "❌ Solo i membri con il ruolo Community Support possono chiudere anticipatamente questo sondaggio.", ephemeral: true });
        }
        await chiudiSondaggio(interaction.client, interaction.message.id, "anticipata", interaction.user);
        return await interaction.reply({ content: "✅ Sondaggio chiuso anticipatamente con successo.", ephemeral: true });
    }

    if (interaction.customId === "poll_voters_info") {
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return await interaction.reply({ content: "❌ Non hai i permessi per visualizzare i partecipanti.", ephemeral: true });
        }

        if (poll.votes.size === 0) {
            return await interaction.reply({ content: "ℹ️ Nessun voto registrato finora.", ephemeral: true });
        }

        let infoText = "**📋 Riepilogo Partecipanti:**\n\n";
        for (const [userId, selectedIndices] of poll.votes.entries()) {
            const optNames = selectedIndices.map(i => poll.options[i]).join(", ");
            infoText += `• <@${userId}> -> Voti: [${optNames}]\n`;
        }

        // LOG VISUALIZZAZIONE PARTECIPANTI
        const infoLogEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle("👁️ Log: Partecipanti Consultati")
            .setDescription(`L'utente <@${interaction.user.id}> ha visualizzato la lista dei partecipanti per il sondaggio: **${poll.question}**`)
            .setTimestamp();
        await sendPollLog(interaction.client, interaction.guild.id, infoLogEmbed);

        return await interaction.reply({ content: infoText, ephemeral: true });
    }

    if (interaction.customId.startsWith("poll_vote_")) {
        const voteIndex = parseInt(interaction.customId.split("_")[2]);
        const userId = interaction.user.id;

        if (!poll.votes) {
            poll.votes = new Map();
        }

        let userVotes = poll.votes.get(userId) || [];

        if (poll.isMultiple) {
            if (userVotes.includes(voteIndex)) {
                userVotes = userVotes.filter(i => i !== voteIndex);
            } else {
                userVotes.push(voteIndex);
            }
        } else {
            if (userVotes.includes(voteIndex)) {
                userVotes = [];
            } else {
                userVotes = [voteIndex];
            }
        }

        if (userVotes.length > 0) {
            poll.votes.set(userId, userVotes);
        } else {
            poll.votes.delete(userId);
        }

        await poll.save();

        // LOG ESPRESSIONE VOTO
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
        const votedOptName = poll.options[voteIndex];
        const actionType = userVotes.includes(voteIndex) ? "ha votato / modificato il voto su" : "ha rimosso il voto da";
        
        const voteLogEmbed = new EmbedBuilder()
            .setColor("#9b59b6")
            .setTitle("🗳️ Log: Voto Registrato")
            .setDescription(`<@${userId}> ${actionType} **${votedOptName}** nel sondaggio: **${poll.question}**`)
            .setTimestamp();
        await sendPollLog(interaction.client, interaction.guild.id, voteLogEmbed);

        const embed = new EmbedBuilder()
            .setColor("#0099FF")
            .setTitle("📊 Sondaggio")
            .setDescription(`**${poll.question}**\n\n` + poll.options.map((opt, i) => `${emojis[i]} - ${opt}`).join("\n") + `\n\n⚙️ **Scelta multipla:** ${poll.isMultiple ? "Sì" : "No"}\n⏳ **Termina tra:** <t:${Math.floor(poll.endTime / 1000)}:R>`)
            .setTimestamp();

        await interaction.update({ embeds: [embed] });
    }
}

async function chiudiSondaggio(client, messageId, tipoChiusura = "scadenza", chiuditore = null) {
    const poll = await Poll.findOne({ messageId, ended: false });
    if (!poll) return;

    poll.ended = true;
    await poll.save();

    let totalVotes = 0;
    const counts = new Array(poll.options.length).fill(0);

    poll.votes.forEach((selectedIndices) => {
        selectedIndices.forEach(index => {
            if (counts[index] !== undefined) {
                counts[index]++;
                totalVotes++;
            }
        });
    });

    let resultsDesc = `**${poll.question}**\n\n`;
    poll.options.forEach((opt, i) => {
        const count = counts[i];
        const percent = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0;
        const barLength = Math.round(percent / 10);
        const bar = "█".repeat(barLength) + "░".repeat(10 - barLength);
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
        resultsDesc += `${emojis[i]} **${opt}**\n${bar} ${percent}% (${count} voti)\n\n`;
    });

    resultsDesc += `📦 **Totale voti unici registrati:** ${totalVotes}`;

    const closedEmbed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("📊 Sondaggio Concluso")
        .setDescription(resultsDesc)
        .setTimestamp();

    // LOG CHIUSURA SONDAGGIO
    const closeLogEmbed = new EmbedBuilder()
        .setColor("#E74C3C")
        .setTitle(`🔒 Log: Sondaggio Chiuso (${tipoChiusura === "anticipata" ? "Anticipata" : "Scadenza Timer"})`)
        .addFields(
            { name: "Domanda", value: poll.question },
            { name: "Modalità Chiusura", value: tipoChiusura === "anticipata" ? `Chiuso da <@${chiuditore.id}>` : "Scaduto automaticamente", inline: true },
            { name: "Totale Voti", value: `${totalVotes}`, inline: true }
        )
        .setTimestamp();
    await sendPollLog(client, poll.guildId, closeLogEmbed);

    try {
        const channel = await client.channels.fetch(poll.channelId);
        if (channel) {
            const msg = await channel.messages.fetch(messageId);
            if (msg) {
                await msg.edit({ embeds: [closedEmbed], components: [] });
            }
        }
    } catch (err) {
        console.error("Errore nella chiusura del sondaggio:", err);
    }
}

module.exports.chiudiSondaggio = chiudiSondaggio;
module.exports.handlePollInteraction = handlePollInteraction;
    
