// =====================================
// ACHIEVEMENT SYSTEM
// Elegance-Bot
// =====================================


const achievements = {


    // ==========================
    // GENERALI
    // ==========================


    first_game: {

        name: "🏁 Prima Partita",

        description:
        "Completa il tuo primo minigame.",

        reward:
        "⭐ +50 XP"

    },



    games_10: {

        name: "🎮 Giocatore Attivo",

        description:
        "Completa 10 minigame.",

        reward:
        "⭐ +100 XP"

    },



    games_50: {

        name: "🏆 Veterano dei Giochi",

        description:
        "Completa 50 minigame.",

        reward:
        "⭐ +250 XP"

    },




    // ==========================
    // QUIZ
    // ==========================


    quiz_first: {

        name:
        "🧠 Prima Risposta",

        description:
        "Vinci il tuo primo quiz.",

        reward:
        "⭐ +50 XP"

    },



    quiz_10: {

        name:
        "📚 Esperto Quiz",

        description:
        "Vinci 10 quiz.",

        reward:
        "⭐ +150 XP"

    },



    quiz_30: {

        name:
        "🎓 Maestro del Quiz",

        description:
        "Completa tutti i 30 quiz disponibili.",

        reward:
        "⭐ +500 XP"

    },




    // ==========================
    // MEMORY
    // ==========================


    memory_first: {

        name:
        "👀 Buona Memoria",

        description:
        "Vinci il primo Memory.",

        reward:
        "⭐ +50 XP"

    },



    memory_10: {

        name:
        "🧩 Memoria Perfetta",

        description:
        "Vinci 10 Memory.",

        reward:
        "⭐ +150 XP"

    },




    // ==========================
    // PAROLA MISTERIOSA
    // ==========================


    word_first: {

        name:
        "🔤 Prima Parola",

        description:
        "Indovina la prima parola misteriosa.",

        reward:
        "⭐ +50 XP"

    },



    word_all: {

        name:
        "📖 Esperto Linguistico",

        description:
        "Completa tutte le difficoltà della Parola Misteriosa.",

        reward:
        "⭐ +250 XP"

    },





    // ==========================
    // REACTION
    // ==========================


    reaction_first: {

        name:
        "⚡ Riflessi Veloci",

        description:
        "Completa il primo Reaction Game.",

        reward:
        "⭐ +50 XP"

    },



    reaction_fast: {

        name:
        "💨 Fulmine",

        description:
        "Completa una Reaction molto velocemente.",

        reward:
        "⭐ +200 XP"

    },





    // ==========================
    // IMPICCATO
    // ==========================


    hangman_first: {

        name:
        "🪢 Sopravvissuto",

        description:
        "Vinci il primo Impiccato.",

        reward:
        "⭐ +50 XP"

    },



    hangman_5: {

        name:
        "🏹 Maestro dell'Impiccato",

        description:
        "Vinci 5 partite di Impiccato.",

        reward:
        "⭐ +250 XP"

    },





    // ==========================
    // ACHIEVEMENT FINALE
    // ==========================


    ultimate_player: {

        name:
        "👑 Leggenda dei Minigame",

        description:
        "Sblocca tutti gli achievement precedenti.",

        reward:
        "🏆 Titolo speciale + Oggetto esclusivo"

    }


};





// =====================================
// FUNZIONI
// =====================================



function getAchievement(id){


    return achievements[id];


}




function getAllAchievements(){


    return achievements;


}





module.exports = {


    achievements,


    getAchievement,


    getAllAchievements


};
