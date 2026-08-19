const path = require('path');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

const stickyPath = path.join(__dirname, 'stickyData.json');

module.exports = {
  initEvents(client) {
    client.on('messageCreate', async (message) => {
      try {
        if (message.author.bot || !message.guild) return;

        if (!fs.existsSync(stickyPath)) return;

        const stickyData = JSON.parse(fs.readFileSync(stickyPath, 'utf-8'));
        const channelSticky = stickyData[message.channel.id];

        if (channelSticky) {
          // Elimina il vecchio messaggio sticky
          if (channelSticky.lastMessageId) {
            try {
              const oldMsg = await message.channel.messages.fetch(channelSticky.lastMessageId);
              if (oldMsg) await oldMsg.delete();
            } catch (err) {
              // Ignora se il messaggio era già stato cancellato
            }
          }

          // Invia il nuovo messaggio sticky in fondo alla chat
          const embed = new EmbedBuilder()
            .setTitle('📌 Messaggio Incollato')
            .setDescription(channelSticky.text)
            .setColor('#2b2d31')
            .setFooter({ text: 'Elegance Sponsoring • Sticky System' });

          const newMsg = await message.channel.send({ embeds: [embed] });

          stickyData[message.channel.id].lastMessageId = newMsg.id;
          fs.writeFileSync(stickyPath, JSON.stringify(stickyData, null, 2), 'utf-8');
        }
      } catch (error) {
        console.error('⚠️ Errore nel sistema Sticky (messageCreate):', error);
      }
    });
  }
};
      
