const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

// Funzione helper per la suspense
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ID del Ruolo BASE (assegnato SEMPRE quando si vince il dolcetto)
const MAIN_TREAT_ROLE = "1560577641898053653";

// ID dei 5 ruoli a rarità per il Bonus Dolcetto
const BONUS_ROLES = [
    { id: "1560577086605754439", name: "👑 Re di Halloween", weight: 5 },    // 5% Leggendario
    { id: "1560576934897909850", name: "🎃 Zucca VIP", weight: 15 },         // 15% Raro
    { id: "1560576338421743626", name: "🍬 Sopravvissuto Elegante", weight: 25 }, // 25% Medio
    { id: "1560576549793701968", name: "👻 Fantasma Flesso", weight: 25 },   // 25% Medio
    { id: "1560576020606877777", name: "🧟‍♂️ Zombi col Papillon", weight: 30 } // 30% Comune
];

// Lista dei 15 nickname marci per lo Scherzetto
const SCARY_NICKNAMES = [
    "Cessetto Mummificato",
    "Cadavere Sfigato",
    "Coso Inutile di Fogna",
    "Scheletro Decerebrato",
    "Goblin Fallito",
    "Zombi Lobotomizzato",
    "Vampiro Impotente",
    "Fantasma Sfigato",
    "Orco Putrefatto",
    "Creatura Deforme",
    "Streghetta Inetta",
    "Carcassa Infetta",
    "Cacca Spettrale",
    "Subumano degli Abissi",
    "Mummia Sfasciata"
];

// Funzione per estrarre un ruolo bonus in base ai pesi %
function getRandomBonusRole() {
    const totalWeight = BONUS_ROLES.reduce((acc, r) => acc + r.weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (const role of BONUS_ROLES) {
        if (randomNum < role.weight) {
            return role;
        }
        randomNum -= role.weight;
    }
    return BONUS_ROLES[0];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("trick-or-treat")
        .setDescription("Tenta la fortuna alla Roulette di Halloween! 🎃🕸️"),

    async execute(interaction) {
        const member = interaction.member;

        // 1. Controllo Furbetto (SOLO VISIBILE A CHI FA IL COMANDO)
        if (member.roles.cache.has(MAIN_TREAT_ROLE)) {
            const warningEmbed = new EmbedBuilder()
                .setTitle("🦇 RIFUTATO DALL'OLTRETOMBA!")
                .setDescription("🍬 **Hai già ricevuto il tuo dolcetto, non fare il furbetto!**\n\n*La tomba non concede doppi regali ai mortali goliardici...*")
                .setColor("#FF0033")
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/3815/3815320.png")
                .setFooter({ text: "Elegance Sponsoring • Halloween Night 🎃" });

            return interaction.reply({
                embeds: [warningEmbed],
                flags: MessageFlags.Ephemeral
            });
        }

        // 2. EMBED DI SUSPENSE INIZIALE (PUBBLICO)
        const suspenseEmbed = new EmbedBuilder()
            .setTitle("🔮 LA ROULETTE DELLE ANIME")
            .setDescription(`🕸️ **${member}** si fa avanti nella nebbia di Halloween...\n\n*💭 Ummmh... Dolcetto o Scherzetto?*`)
            .setColor("#FF6600")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "Elegance Sponsoring • Estrazione in corso..." });

        await interaction.reply({ embeds: [suspenseEmbed] });
        await sleep(1500);

        suspenseEmbed.setDescription(`🕸️ **${member}** attende il suo destino...\n\n*🤔 Le streghe stanno decidendo la tua sorte...*`);
        await interaction.editReply({ embeds: [suspenseEmbed] });
        await sleep(1500);

        // 3. Estrazione: 40% Dolcetto, 60% Scherzetto
        const isTreat = Math.random() < 0.40;

        if (isTreat) {
            // --- DOLCETTO (40%) ---
            const bonusRole = getRandomBonusRole();

            try {
                // Assegnazione ruoli
                await member.roles.add([MAIN_TREAT_ROLE, bonusRole.id]);

                const victoryEmbed = new EmbedBuilder()
                    .setTitle("🎉 DOLCETTO CONCESSO! 🍬")
                    .setDescription(
                        `✨ **Le tenebre sorridono a ${member}!**\n\n` +
                        `✅ **Ruolo Base Sbloccato:** <@&${MAIN_TREAT_ROLE}>\n` +
                        `🎁 **BONUS RITUALISTICO:** Ti sei aggiudicato anche **${bonusRole.name}**!\n\n` +
                        `*Festeggia finché le ombre te lo permettono!*`
                    )
                    .setColor("#FFD700") // Oro brillante
                    .setThumbnail("https://cdn-icons-png.flaticon.com/512/3815/3815228.png")
                    .setFooter({ text: "Elegance Sponsoring •🎃 GG e Buona Fortuna!" })
                    .setTimestamp();

                return interaction.editReply({ embeds: [victoryEmbed] });

            } catch (err) {
                console.error("Errore assegnazione ruoli:", err);
                const errorEmbed = new EmbedBuilder()
                    .setTitle("⚠️ MALEDIZIONE NEI PERMESSI!")
                    .setDescription(`🍬 **${member}** ha vinto il dolcetto, ma gli spiriti del bot non riescono ad assegnare il ruolo! Metti il ruolo del bot più in alto!`)
                    .setColor("#FF0000");

                return interaction.editReply({ embeds: [errorEmbed] });
            }

        } else {
            // --- SCHERZETTO (60%) ---
            const randomNickname = SCARY_NICKNAMES[Math.floor(Math.random() * SCARY_NICKNAMES.length)];

            try {
                await member.setNickname(randomNickname);

                const prankEmbed = new EmbedBuilder()
                    .setTitle("💀 SCHERZETTO MACABRO! 🦇")
                    .setDescription(
                        `😈 **La sfortuna ha divorato ${member}!**\n\n` +
                        `🩸 Il tuo nome umano è stato cancellato.\n` +
                        `🏷️ Fino al **31 Ottobre** sarai conosciuto come:\n` +
                        `👉 **\`${randomNickname}\`**\n\n` +
                        `*Muahaha! Tutti all'inferno ad acclamare il nuovo mostro!*`
                    )
                    .setColor("#9900FF") // Viola oscuro horror
                    .setThumbnail("https://cdn-icons-png.flaticon.com/512/3815/3815234.png")
                    .setFooter({ text: "Elegance Sponsoring •🎃 Sei stato marchiato!" })
                    .setTimestamp();

                return interaction.editReply({ embeds: [prankEmbed] });

            } catch (err) {
                const blockedEmbed = new EmbedBuilder()
                    .setTitle("🛡️ SCUDO ANTI-MALEDIZIONE!")
                    .setDescription(
                        `🦇 **SCHERZETTO INTERROTTO!**\n\n` +
                        `Volevo trasformare ${member} in **\`${randomNickname}\`**, ma il suo aura da Admin / Ruolo Superiore lo protegge...\n\n` +
                        `*Salvo per questo giro, mortale!* 🙄`
                    )
                    .setColor("#333333")
                    .setFooter({ text: "Elegance Sponsoring • Gerarchia Intatta" });

                return interaction.editReply({ embeds: [blockedEmbed] });
            }
        }
    }
};
