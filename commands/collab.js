const {
    SlashCommandBuilder
} = require("discord.js");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("collab")

        .setDescription(
            "Crea una richiesta collaborazione"
        )


        .addStringOption(option =>
            option

                .setName("link")

                .setDescription(
                    "Link invito del server collaboratore"
                )

                .setRequired(true)
        )


        .addUserOption(option =>
            option

                .setName("manager")

                .setDescription(
                    "Referente del server collaboratore"
                )

                .setRequired(true)
        )


        .addStringOption(option =>
            option

                .setName("category")

                .setDescription(
                    "Categoria del server"
                )

                .setRequired(true)

                .addChoices(

                    {
                        name: "🌐 Community",
                        value: "🌐 Community"
                    },

                    {
                        name: "🎮 Gaming",
                        value: "🎮 Gaming"
                    },

                    {
                        name: "🎭 Roleplay",
                        value: "🎭 Roleplay"
                    },

                    {
                        name: "🚗 FiveM",
                        value: "🚗 FiveM"
                    }

                )
        ),



    async execute(interaction) {


        const link =
            interaction.options.getString("link");


        const manager =
            interaction.options.getUser("manager");


        const category =
            interaction.options.getString("category");



        let invite;


        try {

            invite =
                await interaction.client.fetchInvite(link);


        } catch (error) {


            return interaction.reply({

                content:
                    "❌ Link Discord non valido.",

                ephemeral: true

            });

        }



        const partnerServer =
            invite.guild?.name || "Sconosciuto";


        const members =
            invite.approximateMemberCount || "N/D";



        await interaction.reply({

            content:

`━━━━━━━👑━━━━━━━

🌐 **NUOVA COLLABORAZIONE**

**_AUTHOR_**
${interaction.user}

**_MANAGER_**
${manager}

**_CATEGORY_**
${category}

**_SERVER_**
${interaction.guild.name}

**_COLLAB SERVER_**
${partnerServer}

**_MEMBERS_**
${members}

━━━━━━━👑━━━━━━━`

        });


    }

};
