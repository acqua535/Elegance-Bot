const { SlashCommandBuilder } = require("discord.js");

const { sendPartnership } = require("./partnershipHandler");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("partner")

        .setDescription("Invia una partnership")

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione della partnership")
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
                .setDescription("Manager della partnership")
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
            "1522610038831845518",
            "Partner",
            "🤝",
            "#2ecc71"
        );

    }

};
