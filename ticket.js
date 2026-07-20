const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const ticketSystem = require("./ticketSystem");
const transcriptManager = require("./transcriptManager");

const LOG_CHANNEL_ID = "1528576197741772902";
const STAFF_ROLE_ID = "1528576030783176835";
const TICKET_CATEGORY_ID = "1528582447443345560";

const QUESTIONS = {
    partner: ["Nome progetto?", "Membri totali?", "Obiettivo?"],
    staff: ["Età?", "Esperienza?", "Perché dovresti essere scelto?"],
    bug: ["Cos'è successo?", "Dove si è verificato?", "Hai prove/screenshot?"],
    report: ["Chi è l'utente?", "Cosa ha fatto?", "Hai le prove?"]
};

module.exports = {
    // 1. CREAZIONE TICKET E AVVISO
    async categoryHandler(interaction) {
        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `ticket-${type}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        // Step -1 = Attesa del "ok" iniziale
        ticketSystem.createTicket(interaction.user.id, { owner: interaction.user.id, channelId: channel.id, type: type, step: -1 });

        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle("🔔 AVVISO DI APERTURA")
            .setDescription(`Benvenuto ${interaction.user}.\nStai per aprire un ticket per **${type.toUpperCase()}**.\n\nTi verranno poste **3 domande**. Scrivi **'ok'** o **'okay'** per iniziare.`);

        await channel.send({ content: `${interaction.user}`, embeds: [embed] });
        await interaction.editReply({ content: `✅ Ticket creato: ${channel}`, ephemeral: true });
    },

    // 2. LOGICA MESSAGGI (STEP DOMANDE)
    async handleTicketMessage(message) {
        const data = ticketSystem.getTicketByChannel(message.channel.id);
        if (!data || message.author.bot) return;

        // FASE: Attesa "ok"
        if (data.step === -1) {
            const conferme = ["ok", "okay", "si", "certo", "ok!", "d'accordo"];
            if (conferme.includes(message.content.toLowerCase().trim())) {
                data.step = 0;
                ticketSystem.updateTicket(data.owner, data);
                return message.channel.send(`🤖 **Domanda 1:** ${QUESTIONS[data.type][0]}`);
            }
        } 
        // FASE: Domande 1-3
        else if (data.step < 3) {
            data.step++;
            ticketSystem.updateTicket(data.owner, data);
            
            if (data.step < 3) {
                return message.channel.send(`🤖 **Domanda ${data.step + 1}:** ${QUESTIONS[data.type][data.step]}`);
            } else {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("claim_ticket").setLabel("Prendi in carico").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("close_ticket").setLabel("Chiudi Ticket").setStyle(ButtonStyle.Danger)
                );
                return message.channel.send({ content: "✅ **Ricevuto!** Uno staffer arriverà a breve per assisterti.", components: [row] });
            }
        }
    },

    // 3. BOTTONI E RATING
    async buttonHandler(interaction) {
        const data = ticketSystem.getTicketByChannel(interaction.channel.id);
        if (interaction.customId === "claim_ticket") {
            await interaction.update({ components: [] });
            return interaction.channel.send(`✅ Ticket preso in carico da ${interaction.user}.`);
        }
        
        if (interaction.customId === "close_ticket") {
            const file = await transcriptManager.createTranscript(interaction.channel);
            interaction.guild.channels.cache.get(LOG_CHANNEL_ID)?.send({ content: `📁 **Transcript:** ${interaction.channel.name}`, files: [file] });
            
            const user = interaction.guild.members.cache.get(data.owner);
            if (user) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("rate_good").setLabel("🟢 Ottimo").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId("rate_mid").setLabel("🟡 Medio").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("rate_bad").setLabel("🔴 Scarso").setStyle(ButtonStyle.Danger)
                );
                user.send({ content: "Com'è stato il supporto?", components: [row] }).catch(() => {});
            }
            ticketSystem.deleteTicket(data.owner);
            interaction.channel.delete();
        }
    },

    async ratingHandler(interaction) {
        const ratingMap = { "rate_good": "🟢 Ottimo", "rate_mid": "🟡 Medio", "rate_bad": "🔴 Scarso" };
        interaction.update({ content: `Grazie per il tuo feedback: **${ratingMap[interaction.customId]}**!`, components: [] });
        interaction.client.channels.cache.get(LOG_CHANNEL_ID)?.send(`📊 **Voto:** ${ratingMap[interaction.customId]} da ${interaction.user.tag}`);
    }
};
                                                                         
