const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const AI_CHANNEL_ID = "1529276659067523155";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("counting")
        .setDescription("Gestione del sistema di Counting")
        .addSubcommand(subcommand =>
            subcommand
                .setName("setup")
                .setDescription("Imposta il canale per il Counting globale del server")
                .addChannelOption(option =>
                    option
                        .setName("canale")
                        .setDescription("Seleziona il canale dove attivare il Counting")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("ai")
                .setDescription("Attiva il supporto AI per contare da solo")
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // 📌 SUBCOMMAND: /counting setup
        if (subcommand === "setup") {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Devi essere un **Amministratore** per configurare il canale di Counting.", ephemeral: true });
            }

            const targetChannel = interaction.options.getChannel("canale");

            // Impostiamo il canale globale
            if (interaction.client.setCountingChannel) {
                interaction.client.setCountingChannel(targetChannel.id);
            }

            const embed = new EmbedBuilder()
                .setTitle("🔢 Canale Counting Configurato!")
                .setColor(0x57F287)
                .setDescription(`Il gioco del Counting è ora attivo in ${targetChannel}!\n\n**Regole:**\n- Si parte da **1**.\n- Solo numeri ammessi (niente lettere o testo).\n- Un utente non può inviare due numeri di fila.`)
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] });
            return interaction.reply({ content: `✅ Canale impostato con successo su ${targetChannel}!`, ephemeral: true });
        }

        // 📌 SUBCOMMAND: /counting ai
        if (subcommand === "ai") {
            // Verifica ID del canale dedicato
            if (interaction.channelId !== AI_CHANNEL_ID) {
                return interaction.reply({
                    content: `❌ Questo comando può essere utilizzato esclusivamente nel canale dedicato: <#${AI_CHANNEL_ID}>!`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("🤖 Modalità Counting AI")
                .setColor(0x5865F2)
                .setDescription("Vuoi contare da solo in coppia con me?\n\n- Scrivi **`inizia`** se vuoi che inizi ad aiutarti a contare con un grande numero partendo da 1.\n- Scrivi **`cancella`** se vuoi cancellare il supporto dell'AI e resettare la sessione.")
                .setFooter({ text: "Ricorda: solo numeri consentiti durante la partita!" });

            return interaction.reply({ embeds: [embed] });
        }
    }
};
