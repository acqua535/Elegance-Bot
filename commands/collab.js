const {
    SlashCommandBuilder
} = require("discord.js");


const CHANNEL_ID = "1522610038831845518";
const LOG_ID = "1505261606483923105";


module.exports = {

    data: new SlashCommandBuilder()

        .setName("collab")

        .setDescription("Crea una richiesta collaborazione")

        .addUserOption(option =>
            option
                .setName("richiesta_da")
                .setDescription("Utente che richiede la collaborazione")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("categoria")
                .setDescription("Categoria del server")
                .setRequired(true)

                .addChoices(

                    {
                        name:"🌐 Community",
                        value:"🌐 Community"
                    },

                    {
                        name:"🎮 Gaming",
                        value:"🎮 Gaming"
                    },

                    {
                        name:"🎭 Roleplay",
                        value:"🎭 Roleplay"
                    },

                    {
                        name:"🚗 FiveM",
                        value:"🚗 FiveM"
                    }

                )
        )

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione della collaborazione")
                .setRequired(true)
        ),



    async execute(interaction){


        const richiesta =
            interaction.options.getUser("richiesta_da");


        const categoria =
            interaction.options.getString("categoria");


        const descrizione =
            interaction.options.getString("descrizione");



        const partnerMessage =

`━━━━━━━⚜️━━━━━━━

🤝 **RICHIESTA COLLABORAZIONE**

Una nuova collaborazione è stata proposta.

Lo Staff valuterà la richiesta appena possibile.

━━━━━━━⚜️━━━━━━━`;




        const collabMessage =

`━━━━━━━⚜️━━━━━━━

🌐 **NUOVA COLLABORAZIONE**

👤 **Autore**
${interaction.user}

📌 **Richiesta da**
${richiesta}

🏷️ **Categoria**
${categoria}

📝 **Descrizione**
${descrizione}

━━━━━━━⚜️━━━━━━━`;



        const channel =
            interaction.guild.channels.cache.get(
                CHANNEL_ID
            );


        if(!channel){

            return interaction.reply({

                content:
                "❌ Canale collaborazione non trovato.",

                ephemeral:true

            });

        }



        await channel.send(
            partnerMessage
        );


        await channel.send(
            collabMessage
        );



        const log =
            interaction.guild.channels.cache.get(
                LOG_ID
            );


        if(log){

            await log.send(

`📋 **LOG COLLABORAZIONE**

👤 Autore:
${interaction.user}

📌 Richiesta da:
${richiesta}

🏷️ Categoria:
${categoria}

📝 Descrizione:
${descrizione}

⏰ <t:${Math.floor(Date.now()/1000)}:F>`

            );

        }



        await interaction.reply({

            content:
            "✅ Collaborazione inviata correttamente.",

            ephemeral:true

        });


    }

};
