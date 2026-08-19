// ==========================================
// FILE: stickyEvents.js (LOG DI DEBUG DETTAGLIATI)
// ==========================================
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const stickyPath = path.join(__dirname, 'stickyData.json');

function getStickyData() {
  try {
    if (!fs.existsSync(stickyPath)) {
      console.log('[STICKY-DATA] 📄stickyData.json non trovato. Creazione nuovo file...');
      fs.writeFileSync(stickyPath, '{}', 'utf-8');
      return {};
    }
    const data = JSON.parse(fs.readFileSync(stickyPath, 'utf-8'));
    return data;
  } catch (e) {
    console.error('[STICKY-DATA] ❌ Errore lettura/creazione file stickyData.json:', e);
    return {};
  }
}

function saveStickyData(data) {
  try {
    fs.writeFileSync(stickyPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[STICKY-DATA] 💾 Dati salvati con successo su stickyData.json');
  } catch (e) {
    console.error('[STICKY-DATA] ❌ Errore durante il salvataggio di stickyData.json:', e);
  }
}

module.exports = {
  async handleInteraction(interaction) {
    console.log(`[STICKY-EVENT] 🛠️ Inizio gestione interazione: "${interaction.customId}" (Tipo: ${interaction.type})`);
    try {
      const channelId = interaction.channelId;
      const stickyData = getStickyData();

      // 1. TASTO "CREA STICKY" -> APRE IL MODAL
      if (interaction.customId === 'sticky_btn_create') {
        console.log(`[STICKY-EVENT] ➕ Premuto bottone "Crea Sticky" nel canale: ${channelId}`);
        
        const modal = new ModalBuilder()
          .setCustomId('sticky_modal_create')
          .setTitle('Crea Messaggio Sticky');

        const input = new TextInputBuilder()
          .setCustomId('sticky_text_input')
          .setLabel('Testo del messaggio fisso')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Scrivi qui il messaggio che rimarrà sempre in fondo...')
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        console.log(`[STICKY-EVENT] 🚀 Apertura Modal sticky_modal_create in corso...`);
        return await interaction.showModal(modal);
      }

      // 2. INVIO FORM MODAL "CREA STICKY"
      if (interaction.customId === 'sticky_modal_create') {
        console.log(`[STICKY-EVENT] 📝 Modal inviato! Processamento testo in corso per canale: ${channelId}`);
        await interaction.deferReply({ flags: 64 }).catch(() => {});

        const text = interaction.fields.getTextInputValue('sticky_text_input');
        console.log(`[STICKY-EVENT] 📄 Testo inserito: "${text.substring(0, 30)}..."`);

        // Cancellazione eventuale vecchio messaggio sticky
        if (stickyData[channelId] && stickyData[channelId].lastMessageId) {
          console.log(`[STICKY-EVENT] 🗑️ Trovato vecchio sticky (${stickyData[channelId].lastMessageId}). Tetto di eliminarlo...`);
          try {
            const oldMsg = await interaction.channel.messages.fetch(stickyData[channelId].lastMessageId);
            if (oldMsg) {
              await oldMsg.delete();
              console.log(`[STICKY-EVENT] ✅ Vecchio messaggio eliminato.`);
            }
          } catch (e) {
            console.warn(`[STICKY-EVENT] ⚠️ Impossibile eliminare vecchio messaggio (già eliminato o privo di permessi):`, e.message);
          }
        }

        // Invio del nuovo messaggio sticky
        const embed = new EmbedBuilder()
          .setTitle('📌 Messaggio Incollato')
          .setDescription(text)
          .setColor('#2b2d31')
          .setFooter({ text: 'Elegance Sponsoring • Sticky System' });

        console.log(`[STICKY-EVENT] 📤 Invio nuovo messaggio Sticky in chat...`);
        const newMsg = await interaction.channel.send({ embeds: [embed] });
        console.log(`[STICKY-EVENT] ✅ Nuovo messaggio inviato! Message ID: ${newMsg.id}`);

        stickyData[channelId] = {
          text: text,
          lastMessageId: newMsg.id
        };
        saveStickyData(stickyData);

        return await interaction.editReply({ content: '✅ Messaggio sticky creato ed incollato in chat!' });
      }

      // 3. TASTO "ELIMINA STICKY"
      if (interaction.customId === 'sticky_btn_delete') {
        console.log(`[STICKY-EVENT] 🗑️ Premuto bottone "Elimina Sticky" nel canale: ${channelId}`);
        await interaction.deferReply({ flags: 64 }).catch(() => {});

        if (!stickyData[channelId]) {
          console.log(`[STICKY-EVENT] ⚠️ Nessun sticky registrato per questo canale.`);
          return await interaction.editReply({ content: '❌ Non c\'è alcun messaggio sticky attivo in questo canale.' });
        }

        if (stickyData[channelId].lastMessageId) {
          console.log(`[STICKY-EVENT] 🗑️ Eliminazione messaggio sticky (${stickyData[channelId].lastMessageId})...`);
          try {
            const oldMsg = await interaction.channel.messages.fetch(stickyData[channelId].lastMessageId);
            if (oldMsg) await oldMsg.delete();
            console.log(`[STICKY-EVENT] ✅ Messaggio rimosso dalla chat.`);
          } catch (e) {
            console.warn(`[STICKY-EVENT] ⚠️ Impossibile eliminare messaggio dalla chat:`, e.message);
          }
        }

        delete stickyData[channelId];
        saveStickyData(stickyData);

        return await interaction.editReply({ content: '🗑️ Messaggio sticky rimosso con successo!' });
      }

    } catch (error) {
      console.error('🚨 [STICKY-EVENT ERRORE FATALE]:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Errore durante l\'esecuzione dell\'azione.', flags: 64 }).catch(() => {});
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
          console.log(`[STICKY-AUTO] 💬 Nuovo messaggio registrato in canale con Sticky attivo (${message.channel.id})`);

          if (channelSticky.lastMessageId) {
            try {
              const oldMsg = await message.channel.messages.fetch(channelSticky.lastMessageId);
              if (oldMsg) await oldMsg.delete();
              console.log(`[STICKY-AUTO] 🗑️ Vecchio Sticky rimosso.`);
            } catch (err) {
              console.warn(`[STICKY-AUTO] ⚠️ Non è stato possibile rimuovere il vecchio Sticky:`, err.message);
            }
          }

          const embed = new EmbedBuilder()
            .setTitle('📌 Messaggio Incollato')
            .setDescription(channelSticky.text)
            .setColor('#2b2d31')
            .setFooter({ text: 'Elegance Sponsoring • Sticky System' });

          const newMsg = await message.channel.send({ embeds: [embed] });
          console.log(`[STICKY-AUTO] 📌 Nuovo Sticky incollato in fondo. ID: ${newMsg.id}`);

          stickyData[message.channel.id].lastMessageId = newMsg.id;
          saveStickyData(stickyData);
        }
      } catch (error) {
        console.error('⚠️ [STICKY-AUTO ERRORE]:', error);
      }
    });
  }
};
                                 
