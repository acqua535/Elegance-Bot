const path = require('path');
const fs = require('fs');
const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const stickyPath = path.join(process.cwd(), 'stickyData.json');

function getStickyData() {
  try {
    if (!fs.existsSync(stickyPath)) return {};
    return JSON.parse(fs.readFileSync(stickyPath, 'utf-8'));
  } catch {
    return {};
  }
}

function saveStickyData(data) {
  try {
    fs.writeFileSync(stickyPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('⚠️ Errore salvataggio stickyData.json:', err);
  }
}

module.exports = {
  async handleInteraction(interaction) {
    try {
      const channelId = interaction.channel.id;
      const stickyData = getStickyData();

      // 1. Bottone "Crea Sticky" -> Apre il Modal
      if (interaction.isButton() && interaction.customId === 'sticky_btn_create') {
        const modal = new ModalBuilder()
          .setCustomId('sticky_modal_create')
          .setTitle('Crea Messaggio Sticky');

        const input = new TextInputBuilder()
          .setCustomId('sticky_text_input')
          .setLabel('Testo del messaggio fisso')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Scrivi qui il messaggio che rimarrà sempre in fondo...')
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return await interaction.showModal(modal);
      }

      // 2. Invio del Form Modal "Crea Sticky"
      if (interaction.isModalSubmit() && interaction.customId === 'sticky_modal_create') {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});

        const text = interaction.fields.getTextInputValue('sticky_text_input');

        // Cancella eventuale vecchio messaggio sticky
        if (stickyData[channelId] && stickyData[channelId].lastMessageId) {
          try {
            const oldMsg = await interaction.channel.messages.fetch(stickyData[channelId].lastMessageId);
            if (oldMsg) await oldMsg.delete();
          } catch (e) {}
        }

        const embed = new EmbedBuilder()
          .setTitle('📌 Messaggio Incollato')
          .setDescription(text)
          .setColor('#2b2d31')
          .setFooter({ text: 'Elegance Sponsoring • Sticky System' });

        const newMsg = await interaction.channel.send({ embeds: [embed] });

        stickyData[channelId] = {
          text: text,
          lastMessageId: newMsg.id
        };
        saveStickyData(stickyData);

        return await interaction.editReply({ content: '✅ Messaggio sticky creato ed incollato in chat!' });
      }

      // 3. Bottone "Elimina Sticky"
      if (interaction.isButton() && interaction.customId === 'sticky_btn_delete') {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});

        if (!stickyData[channelId]) {
          return await interaction.editReply({ content: '❌ Non c\'è alcun messaggio sticky attivo in questo canale.' });
        }

        if (stickyData[channelId].lastMessageId) {
          try {
            const oldMsg = await interaction.channel.messages.fetch(stickyData[channelId].lastMessageId);
            if (oldMsg) await oldMsg.delete();
          } catch (e) {}
        }

        delete stickyData[channelId];
        saveStickyData(stickyData);

        return await interaction.editReply({ content: '🗑️ Messaggio sticky rimosso con successo da questo canale!' });
      }
    } catch (error) {
      console.error('🚨 Errore gestione interazione Sticky:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Errore durante l\'esecuzione dell\'azione.', ephemeral: true }).catch(() => {});
      }
    }
  },

  initEvents(client) {
    client.on('messageCreate', async (message) => {
      try {
        if (message.author.bot || !message.guild) return;

        const stickyData = getStickyData();
        const channelSticky = stickyData[message.channel.id];

        if (channelSticky) {
          if (channelSticky.lastMessageId) {
            try {
              const oldMsg = await message.channel.messages.fetch(channelSticky.lastMessageId);
              if (oldMsg) await oldMsg.delete();
            } catch (err) {}
          }

          const embed = new EmbedBuilder()
            .setTitle('📌 Messaggio Incollato')
            .setDescription(channelSticky.text)
            .setColor('#2b2d31')
            .setFooter({ text: 'Elegance Sponsoring • Sticky System' });

          const newMsg = await message.channel.send({ embeds: [embed] });

          stickyData[message.channel.id].lastMessageId = newMsg.id;
          saveStickyData(stickyData);
        }
      } catch (error) {
        console.error('⚠️ Errore nel sistema Sticky (messageCreate):', error);
      }
    });
  }
};
            
