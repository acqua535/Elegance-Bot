const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Pannello di gestione dei messaggi fissi (Sticky)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📌 Gestione Messaggi Sticky')
      .setDescription('Usa i pulsanti sottostanti per creare o rimuovere un messaggio fisso in questo canale.')
      .setColor('#2b2d31')
      .setFooter({ text: 'Elegance Sponsoring • Sticky System' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('sticky_btn_create')
        .setLabel('Crea Sticky')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('sticky_btn_delete')
        .setLabel('Elimina Sticky')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️')
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }
};
