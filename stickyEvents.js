const path = require('path');
const fs = require('fs');
const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const stickyPath = path.join(__dirname, 'stickyData.json');

// Inizializza il file JSON se non esiste
if (!fs.existsSync(stickyPath)) {
  fs.writeFileSync(stickyPath, JSON.stringify({}), 'utf-8');
}

function getStickyData() {
  try {
    return JSON.parse(fs.readFileSync(stickyPath, 'utf-8'));
  } catch {
    return {};
  }
}

function saveStickyData(data) {
  fs.writeFileSync(stickyPath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  // Gestore per i Bottoni ed il Pop-Up (Modal)
  async handleInteraction(interaction) {
    const channelId = interaction.channel.id;
    const stickyData = getStickyData();

    // 1. Pressione del Bottone "Crea Sticky"
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

    // 2. Invio del Form (Modal Submit) per "Crea Sticky"
    if (interaction.isModalSubmit() && interaction.customId === 'sticky_modal_create') {
      const text = interaction.fields.getTextInputValue('sticky_text_input');

      // Se c'è già uno sticky vecchio, prova a cancellarlo
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

      return interaction.reply({ content: '✅ Messaggio sticky creato ed incollato!', ephemeral: true });
    }

    // 3. Pressione del Bottone "Elimina Sticky"
    if (interaction.isButton() && interaction.customId === 'sticky_btn_delete') {
      if (!stickyData[channelId]) {
        return interaction.reply({ content: '❌ Non c\'è alcun messaggio sticky attivo in questo canale.', ephemeral: true });
      }

      // Prova a cancellare l'ultimo messaggio inviato dal bot
      if (stickyData[channelId].lastMessageId) {
        try {
          const oldMsg = await interaction.channel.messages.fetch(stickyData[channelId].lastMessageId);
          if (oldMsg) await oldMsg.delete();
        } catch (e) {}
      }

      delete stickyData[channelId];
      saveStickyData(stickyData);

      return interaction.reply({ content: '🗑️ Messaggio sticky rimosso con successo da questo canale!', ephemeral: true });
    }
  },

  // Evento automatico che riinvia lo sticky quando la gente scrive
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
        console.error('⚠️ Errore nel sistema Sticky:', error);
      }
    });
  }
};
