const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steal-emoji')
    .setDescription('Copia un\'emoji da un altro server e la aggiunge a questo!')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Incolla l\'emoji, il testo <:nome:ID> oppure solo l\'ID')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Il nome da dare all\'emoji nel tuo server')
        .setRequired(true)),

  async execute(interaction) {
    const rawEmoji = interaction.options.getString('emoji');
    const name = interaction.options.getString('nome');

    // Trova l'ID dell'emoji (supporta da 15 a 20 cifre)
    const idMatch = rawEmoji.match(/\d{15,20}/);

    if (!idMatch) {
      return interaction.reply({ 
        content: '❌ Impossibile trovare un ID emoji valido! Controlla di aver inserito il testo corretto.', 
        ephemeral: true 
      });
    }

    const emojiId = idMatch[0];
    const isAnimated = rawEmoji.includes('<a:') || rawEmoji.startsWith('a_');
    
    // Prova prima con il formato rilevato (gif o png)
    const primaryExtension = isAnimated ? 'gif' : 'png';
    const primaryUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${primaryExtension}`;

    await interaction.deferReply();

    try {
      const createdEmoji = await interaction.guild.emojis.create({ attachment: primaryUrl, name: name });

      const embed = new EmbedBuilder()
        .setTitle('✨ Emoji Aggiunta con Successo!')
        .setDescription(`L'emoji ${createdEmoji} è stata aggiunta al server come \`:${name}:\`!`)
        .setColor('#2b2d31')
        .setThumbnail(primaryUrl)
        .setFooter({ text: 'Elegance Sponsoring System' });

      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      // Se fallisce (ad esempio era una GIF ma l'aveva scambiata per PNG o viceversa), fa un tentativo di backup
      const fallbackExtension = isAnimated ? 'png' : 'gif';
      const fallbackUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${fallbackExtension}`;

      try {
        const createdEmoji = await interaction.guild.emojis.create({ attachment: fallbackUrl, name: name });

        const embed = new EmbedBuilder()
          .setTitle('✨ Emoji Aggiunta con Successo!')
          .setDescription(`L'emoji ${createdEmoji} è stata aggiunta al server come \`:${name}:\`!`)
          .setColor('#2b2d31')
          .setThumbnail(fallbackUrl)
          .setFooter({ text: 'Elegance Sponsoring System' });

        return interaction.editReply({ embeds: [embed] });

      } catch (retryError) {
        console.error('Errore in steal-emoji:', retryError);
        return interaction.editReply({ 
          content: '❌ Impossibile aggiungere l\'emoji! Assicurati che lo spazio emoji del server non sia pieno e che l\'ID sia di un\'emoji personalizzata esistente.' 
        });
      }
    }
  },
};
          
