const { SlashCommandBuilder } = require("discord.js");

const { sendPartnership } = require("./partnerSystem");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("sponsor")

        .setDescription("Invia uno sponsor")

        .addStringOption(option =>
            option
                .setName("descrizione")
                .setDescription("Descrizione dello sponsor")
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
                .setDescription("Manager dello sponsor")
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
            "1521856540016115803",
            "Sponsor",
            "⚜️",
            "#f1c40f"
        );

    }

};
