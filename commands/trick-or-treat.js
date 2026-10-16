const { SlashCommandBuilder, MessageFlags } = require("discord.js");

// Funzione helper per la suspense
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ID del Ruolo BASE (assegnato SEMPRE quando si vince il dolcetto)
const MAIN_TREAT_ROLE = "1560577641898053653";

// ID dei 5 ruoli a rarità per lo "Bonus Dolcetto"
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
        .setDescription("Tenta la fortuna: Dolcetto o Scherzetto? 🎃"),

    async execute(interaction) {
        const member = interaction.member;

        // 1. Controllo se l'utente ha già il ruolo dolcetto base
        if (member.roles.cache.has(MAIN_TREAT_ROLE)) {
            return interaction.reply({
                content: "🍬 Hai già ricevuto il tuo dolcetto, non fare il furbetto!",
                flags: MessageFlags.Ephemeral
            });
        }

        // Risposta immediata in Ephemeral per gestire l'edit con la suspense
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // 2. Suspense a intervalli di 1.5 secondi
        await interaction.editReply({ content: "💭 Umhh... dolcetto o scherzetto?" });
        await sleep(1500);
        await interaction.editReply({ content: "🤔 Fammi pensare..." });
        await sleep(1500);

        // 3. Estrazione: 30% Dolcetto, 70% Scherzetto
        const isTreat = Math.random() < 0.30;

        if (isTreat) {
            // --- DOLCETTO (30%) ---
            const bonusRole = getRandomBonusRole();

            try {
                // Assegniamo il ruolo base a prescindere + il ruolo bonus estratto
                await member.roles.add([MAIN_TREAT_ROLE, bonusRole.id]);

                return interaction.editReply({
                    content: `🎉 **DOLCETTO!** Ti è powders andata di lusso! 🍬\n\n` +
                             `✅ Ti è stato assegnato il ruolo Dolcetto Base!\n` +
                             `🎁 **BONUS EXTRA:** Hai sbloccato anche il ruolo **${bonusRole.name}**! GG!`
                });
            } catch (err) {
                console.error("Errore assegnazione ruoli:", err);
                return interaction.editReply({
                    content: "🍬 È uscito il dolcetto, ma c'è un problema coi permessi del bot nella gerarchia dei ruoli! Assicurati che il ruolo del bot sia in ALTO nella lista dei ruoli."
                });
            }

        } else {
            // --- SCHERZETTO (70%) ---
            const randomNickname = SCARY_NICKNAMES[Math.floor(Math.random() * SCARY_NICKNAMES.length)];

            try {
                await member.setNickname(randomNickname);
                return interaction.editReply({
                    content: `🦇 **SCHERZETTO!** Ti sei beccato la sfortuna! Da oggi il tuo nuovo nome nel server è **${randomNickname}** (fino al 31 Ottobre)! Muahaha! 💀`
                });
            } catch (err) {
                return interaction.editReply({
                    content: `🦇 **SCHERZETTO!** Volevo cambiarti il nome in **${randomNickname}**, ma la gerarchia dei ruoli o i tuoi permessi da Admin mi impediscono di toccarti... Salvato per un pelo! 🙄`
                });
            }
        }
    }
};
