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
                .setDescription("Descrizione dell'embed (usa \\n per andare a capo)")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("colore")
                .setDescription("Scegli un colore acceso per l'embed")
                .setRequired(false)
                .addChoices(
                    { name: 'Blu Elettrico', value: '#0055FF' },
                    { name: 'Rosso Fuoco', value: '#FF0033' },
                    { name: 'Verde Neon', value: '#00FF66' },
                    { name: 'Viola Acceso', value: '#9900FF' },
                    { name: 'Giallo Sole', value: '#FFCC00' },
                    { name: 'Arancione Vivo', value: '#FF6600' }
                )
        ),

    async execute(interaction) {
        try {
            // Controllo permessi ruolo
            if (!interaction.member.roles.cache.has(EMBED_ROLE_ID)) {
                console.warn(`[SECURITY] Tentativo di esecuzione non autorizzata del comando /embed da parte di ${interaction.user.tag} (${interaction.user.id})`);
                return interaction.reply({
                    content: "❌ **Accesso Negato:** Non possiedi il ruolo autorizzato per eseguire questo comando.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const titolo = interaction.options.getString("titolo");
            const descrizione = interaction.options.getString("descrizione");
            
            // Prende il colore scelto dal menu a tendina o usa un grigio scuro di default
            const coloreFinale = interaction.options.getString("colore") || "#2f3136";

            const embed = new EmbedBuilder()
                .setTitle(titolo)
                .setDescription(descrizione.replace(/\\n/g, "\n")) // Supporto per i a capo corretti
                .setColor(coloreFinale)
                .setFooter({ text: `Creato da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            console.log(`[EMBED_COMMAND] Embed creato con successo nel canale #${interaction.channel?.name || 'sconosciuto'} da ${interaction.user.tag}`);

        } catch (error) {
            console.error("🚨 Errore durante l'esecuzione del comando /embed:", error);
            const errorMessage = "❌ Si è verificato un errore durante la creazione dell'embed.";
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
            } else {
                await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
    }
};
