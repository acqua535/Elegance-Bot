const { SlashCommandBuilder } = require("discord.js");

const { sendPartnership } = require("./partnershipHandler");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("collab")

        .setDescription("Invia una collaborazione")

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione della collaborazione")
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("ping")
                .setDescription("Ruolo da menzionare")
                .setRequired(false)
        )

        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription("Manager della collaborazione")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("data")
                .setDescription("Data opzionale")
                .setRequired(false)
        ),


    async execute(interaction) {

        await sendPartnership(

            interaction,

            "1508774443286003815",

            "Collab",

            "🤝",

            "#3498db"

        );

    }

};
