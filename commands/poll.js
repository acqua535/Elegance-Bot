const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { Poll } = require("./Setup");

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

        const message = await interaction.reply({ embeds: [embed], components: [row, controlRow], fetchReply: true });

        await Poll.create({
            messageId: message.id,
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            question,
            options,
            isMultiple,
            endTime,
            votes: new Map(),
            ended: false
        });

        setTimeout(() => {
            chiudiSondaggio(message.client, message.id);
        }, msDuration);
    }
};

async function chiudiSondaggio(client, messageId) {
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
