const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Frasi horror casuali per la maledizione dell'avatar
const HORROR_CURSES = [
    "L'anima di questo profilo è stata divorata dalle ombre. Ciò che vedi non è più un essere umano.",
    "Un'entità antica ha preso possesso di questa immagine. Non fissare i suoi occhi troppo a lungo.",
    "Il volto nell'avatar sta lentamente marcendo. Ogni ora che passa perde un pezzo di umanità.",
    "Questa figura vagava nei canali abbandonati del server... ora cerca una nuova vittima da trascinare nel buio.",
    "L'immagine è stata maledetta durante il rito di Halloween. Chiunque la guardi sentirà dei sussurri stanotte.",
    "Un parassita dell'Oltretomba ha sostituito la sua presenza digitale. Fai molta attenzione se ti invia un PM."
];

// GIF / Immagini di sfondo o addobbi horror
const HORROR_GIFS = [
    "https://media.giphy.com/media/3ohjV8JRMcNVGYK10I/giphy.gif",
    "https://media.giphy.com/media/13GdXy1FkvHjoc/giphy.gif",
    "https://media.giphy.com/media/67tyJbqnsNH9uHBkUq/giphy.gif"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar-horror")
        .setDescription("Ispeziona l'avatar di un utente per scoprirne la maledizione di Halloween 👁️🎃")
        .addUserOption(option => 
            option.setName("utente")
                .setDescription("L'utente da analizzare (lascia vuoto per analizzare te stesso)")
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("utente") || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        // Recuperiamo l'avatar ad alta risoluzione
        const avatarUrl = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });

        // Calcoliamo casualmente il livello di maledizione (da 66% a 100%)
        const curseLevel = Math.floor(Math.random() * 35) + 66;

        // Selezioniamo una frase ed una GIF casuali
        const randomCurse = HORROR_CURSES[Math.floor(Math.random() * HORROR_CURSES.length)];
        const randomGif = HORROR_GIFS[Math.floor(Math.random() * HORROR_GIFS.length)];

        const horrorEmbed = new EmbedBuilder()
            .setTitle(`👁️ REPERTO DALL'OLTRETOMBA: ${targetUser.username.toUpperCase()}`)
            .setDescription(
                `🩸 **ANALISI DELL'ANIMA DIGITALIZZATA**\n\n` +
                `👤 **Soggetto:** ${targetUser}\n` +
                `📊 **Livello di Maledizione:** \`${curseLevel}%\` ⚠️\n\n` +
                `📜 **Verdetto degli Spiriti:**\n*${randomCurse}*`
            )
            .setColor("#8B0000") // Rosso sangue scuro
            .setImage(avatarUrl) // L'avatar in grande al centro
            .setThumbnail(randomGif) // Icona animata di contorno
            .setFooter({ text: "Elegance Sponsoring • Maledizione di Halloween 🎃" })
            .setTimestamp();

        return interaction.reply({ embeds: [horrorEmbed] });
    }
};

