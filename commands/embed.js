const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

const EMBED_ROLE_ID = "1528576014446231683";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Crea un embed personalizzato tramite Elegance Sponsoring")
        .addStringOption(option =>
            option
                .setName("titolo")
                .setDescription("Titolo dell'embed")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione dell'embed")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("colore")
                .setDescription("Colore HEX dell'embed (es: #5865F2)")
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(EMBED_ROLE_ID)) {
            console.warn(`[SECURITY] Tentativo di esecuzione non autorizzata del comando /embed da parte di ${interaction.user.tag} (${interaction.user.id})`);
            return interaction.reply({
                content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per eseguire questo comando.",
                flags: MessageFlags.Ephemeral
            });
        }

        const titolo = interaction.options.getString("titolo");
        const descrizione = interaction.options.getString("descrizione");
        const colore = interaction.options.getString("colore") || "#2f3136";

        const embed = new EmbedBuilder()
            .setTitle(titolo)
            .setDescription(descrizione)
            .setColor(colore)
            .setFooter({ text: `Creato da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        console.log(`[EMBED_COMMAND] Embed creato con successo nel canale #${interaction.channel.name} da ${interaction.user.tag}`);
    }
};
