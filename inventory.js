const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const gameSystem = require("./gameSystem");



module.exports = {


    data: new SlashCommandBuilder()

        .setName("inventory")

        .setDescription(
            "Mostra il tuo inventario gaming"
        ),



    async execute(interaction) {


        const userId =
            interaction.user.id;



        const profile =
            gameSystem.getProfile(userId);



        const items =
            profile.inventory.length > 0

            ? profile.inventory.join("\n")

            : "Nessun oggetto ottenuto 🎁";



        const achievements =
            profile.achievements.length > 0

            ? profile.achievements.length

            : "0";



        const embed =
            new EmbedBuilder()

            .setTitle(
                `🎒 Inventario di ${interaction.user.username}`
            )

            .setThumbnail(
                interaction.user.displayAvatarURL({
                    dynamic: true
                })
            )

            .setDescription(

`
━━━━━━━━━━━━━━━━

🪙 **Monete**
${profile.coins || 0}

━━━━━━━━━━━━━━━━

🎁 **Oggetti**

${items}

━━━━━━━━━━━━━━━━

🏆 **Achievement sbloccati**
${achievements}

━━━━━━━━━━━━━━━━

Continua a giocare per ottenere nuove ricompense! ⚜️
`

            )

            .setColor("Gold");



        await interaction.reply({

            embeds:[
                embed
            ]

        });


    }


};
