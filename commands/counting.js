// ==========================================
// FILE: counting.js (VERSIONE COMPLETA E INTEGRATA)
// ==========================================
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");

const AI_CHANNEL_ID = "1529276659067523155";
const SETUPS_PATH = path.join(__dirname, "setups.json");

// Helper per leggere dal file setups.json
const getSetups = () => {
    if (!fs.existsSync(SETUPS_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(SETUPS_PATH, "utf8"));
    } catch {
        return {};
    }
};

// Helper per salvare la configurazione del Counting su setups.json
const saveCountingSetup = (guildId, data) => {
    const setups = getSetups();
    setups[guildId] = {
        ...setups[guildId],
        countingChannel: data.countingChannel !== undefined ? data.countingChannel : (setups[guildId]?.countingChannel || null),
        countingAiEnabled: data.aiEnabled !== undefined ? data.aiEnabled : (setups[guildId]?.countingAiEnabled ?? false)
    };
    fs.writeFileSync(SETUPS_PATH, JSON.stringify(setups, null, 4));
};

// Ottiene la configurazione salvata per la gilda
const getGuildCountingConfig = (guildId) => {
    const setups = getSetups();
    return {
        countingChannel: setups[guildId]?.countingChannel || null,
        aiEnabled: setups[guildId]?.countingAiEnabled ?? false
    };
};

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
        const guildId = interaction.guild.id;

        // 📌 SUBCOMMAND: /counting setup
        if (subcommand === "setup") {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ 
                    content: "❌ Devi essere un **Amministratore** per configurare il canale di Counting.", 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const targetChannel = interaction.options.getChannel("canale");

            // Salvataggio nel file setups.json
            saveCountingSetup(guildId, { countingChannel: targetChannel.id });

            // Mantiene il supporto all'eventuale istanza dinamica in memoria
            if (interaction.client.setCountingChannel) {
                interaction.client.setCountingChannel(targetChannel.id);
            }

            const embed = new EmbedBuilder()
                .setTitle("🔢 Canale Counting Configurato!")
                .setColor(0x57F287)
                .setDescription(`Il gioco del Counting è ora attivo in ${targetChannel}!\n\n**Regole:**\n- Si parte da **1**.\n- Solo numeri ammessi (niente lettere o testo).\n- Un utente non può inviare due numeri di fila.`)
                .setTimestamp();

            await targetChannel.send({ embeds: [embed] }).catch(() => {});
            return interaction.reply({ 
                content: `✅ Canale impostato e salvato in \`setups.json\` su ${targetChannel}!`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 📌 SUBCOMMAND: /counting ai
        if (subcommand === "ai") {
            // Verifica ID del canale dedicato
            if (interaction.channelId !== AI_CHANNEL_ID) {
                return interaction.reply({
                    content: `❌ Questo comando può essere utilizzato esclusivamente nel canale dedicato: <#${AI_CHANNEL_ID}>!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            // Imposta lo stato dell'AI su attivo nel JSON
            saveCountingSetup(guildId, { aiEnabled: true });

            const embed = new EmbedBuilder()
                .setTitle("🤖 Modalità Counting AI")
                .setColor(0x5865F2)
                .setDescription("Vuoi contare da solo in coppia con me?\n\n- Scrivi **`inizia`** se vuoi che inizi ad aiutarti a contare partendo da 1.\n- Scrivi **`cancella`** se vuoi cancellare il supporto dell'AI e resettare la sessione.")
                .setFooter({ text: "Ricorda: solo numeri consentiti durante la partita!" });

            return interaction.reply({ embeds: [embed] });
        }
    },

    // Esposizione funzioni helper per il sistema
    getGuildCountingConfig,
    saveCountingSetup
};
                                  
