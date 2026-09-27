const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('senddm')
        .setDescription('Invia un messaggio in embed privato a un utente')
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L\'utente a cui inviare il messaggio')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('messaggio')
                .setDescription('Il testo del messaggio da inviare')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('colore')
                .setDescription('Scegli un colore acceso per l\'embed')
                .setRequired(true)
                .addChoices(
                    { name: '🔵 Blu Elettrico', value: '#0055FF' },
                    { name: '🔴 Rosso Fuoco', value: '#FF0033' },
                    { name: '🟢 Verde Neon', value: '#00FF66' },
                    { name: '🟣 Viola Acceso', value: '#9900FF' },
                    { name: '🟡 Giallo Sole', value: '#FFCC00' },
                    { name: '🟠 Arancione Vivo', value: '#FF6600' }
                )),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('utente');
        const messageText = interaction.options.getString('messaggio');
        const colorHex = interaction.options.getString('colore');

        // Evitiamo di mandare DM ai bot
        if (targetUser.bot) {
            return interaction.reply({ 
                content: '❌ Non puoi mandare un DM a un altro bot!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        // Creiamo l'embed con il colore scelto e un look stiloso
        const embed = new EmbedBuilder()
            .setTitle('📩 Comunicazione dallo Staff')
            .setDescription(messageText)
            .setColor(colorHex)
            .setTimestamp()
            .setFooter({ text: `Richiesto da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        try {
            // Inviamo l'embed nei DM dell'utente
            await targetUser.send({ embeds: [embed] });

            // Conferma visibile solo a te
            return interaction.reply({ 
                content: `✅ Embed inviato con successo a **${targetUser.tag}**!`, 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            // Controllo errore DM chiusi (Codice 50007)
            if (error.code === 50007) {
                return interaction.reply({ 
                    content: `❌ Impossibile inviare il DM a **${targetUser.tag}**. Ha i messaggi privati chiusi o ha bloccato il bot!`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // Gestione di altri errori imprevisti
            console.error(error);
            return interaction.reply({ 
                content: `❌ Si è verificato un errore inaspettato durante l'invio del messaggio.`, 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};
