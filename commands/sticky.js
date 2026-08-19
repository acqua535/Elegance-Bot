const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const stickyPath = path.join(__dirname, '../stickyData.json');

// Assicura che il file JSON esista
if (!fs.existsSync(stickyPath)) {
  fs.writeFileSync(stickyPath, JSON.stringify({}), 'utf-8');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Gestisci i messaggi fissi in chat')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Imposta un messaggio sticky in questo canale')
        .addStringOption(opt => opt.setName('messaggio').setDescription('Il testo da tenere fisso').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Rimuovi il messaggio sticky da questo canale')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channelId = interaction.channel.id;
    const stickyData = JSON.parse(fs.readFileSync(stickyPath, 'utf-8'));

    if (subcommand === 'set') {
      const text = interaction.options.getString('messaggio');

      const embed = new EmbedBuilder()
        .setTitle('📌 Messaggio Incollato')
        .setDescription(text)
        .setColor('#2b2d31')
        .setFooter({ text: 'Elegance Sponsoring • Sticky System' });

      const msg = await interaction.channel.send({ embeds: [embed] });

      stickyData[channelId] = {
        text: text,
        lastMessageId: msg.id
      };

      fs.writeFileSync(stickyPath, JSON.stringify(stickyData, null, 2), 'utf-8');

      return interaction.reply({ content: '✅ Messaggio sticky impostato con successo!', ephemeral: true });
    } 

    if (subcommand === 'remove') {
      if (!stickyData[channelId]) {
        return interaction.reply({ content: '❌ Non c\'è alcun messaggio sticky in questo canale.', ephemeral: true });
      }

      delete stickyData[channelId];
      fs.writeFileSync(stickyPath, JSON.stringify(stickyData, null, 2), 'utf-8');

      return interaction.reply({ content: '🗑️ Messaggio sticky rimosso da questo canale.', ephemeral: true });
    }
  },
};
