const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steal-emoji')
    .setDescription('Copia un\'emoji da un altro server e la aggiunge a questo!')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('L\'emoji da rubare (incolla l\'emoji o l\'ID)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Il nome da dare all\'emoji nel tuo server')
        .setRequired(true)),

  async execute(interaction) {
    const rawEmoji = interaction.options.getString('emoji');
    const name = interaction.options.getString('nome');

    // Estrae l'ID e il tipo (animata o statica) dall'emoji
    const customEmojiMatch = rawEmoji.match(/<:(a)?:(\w+):(\d+)>/);

    if (!customEmojiMatch) {
      return interaction.reply({ 
        content: '❌ Per favore fornisci un\'emoji personalizzata valida di Discord!', 
        ephemeral: true 
      });
    }

    const isAnimated = Boolean(customEmojiMatch[1]);
    const emojiId = customEmojiMatch[3];
    const extension = isAnimated ? 'gif' : 'png';
    const url = `https://cdn.discordapp.com/emojis/${emojiId}.${extension}`;

    try {
      // Crea l'emoji nel server
      const createdEmoji = await interaction.guild.emojis.create({ attachment: url, name: name });

      const embed = new EmbedBuilder()
        .setTitle('✨ Emoji Aggiunta con Successo!')
        .setDescription(`L'emoji ${createdEmoji} è stata aggiunta al server come \`:${name}:\`!`)
        .setColor('#2b2d31')
        .setThumbnail(url)
        .setFooter({ text: 'Elegance Sponsoring System' });

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Errore in steal-emoji:', error);
      return interaction.reply({ 
        content: '❌ Impossibile aggiungere l\'emoji. Verifica che il server non abbia raggiunto il limite massimo di emoji o che il bot abbia i permessi necessari!', 
        ephemeral: true 
      });
    }
  },
};
