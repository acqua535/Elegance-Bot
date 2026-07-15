const discordTranscripts = require("discord-html-transcripts");


// =====================================
// CONFIG
// =====================================

const TRANSCRIPT_CONFIG = {

    limit: -1,

    returnBuffer: false,

    saveImages: true,

    filename: "transcript.html"

};



// =====================================
// CREATE HTML TRANSCRIPT
// =====================================

async function createTranscript(channel) {


    try {


        const transcript = await discordTranscripts.createTranscript(

            channel,

            {

                ...TRANSCRIPT_CONFIG,

                filename:

                `transcript-${channel.name}.html`

            }

        );


        return transcript;


    } catch(error) {


        console.error(

            "❌ Errore creazione transcript:",

            error

        );


        throw error;


    }


}



module.exports = {

    createTranscript

};
