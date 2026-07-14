const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const PARTNER_CHANNEL = "1508774443286003815";


module.exports = {

    data: new SlashCommandBuilder()

        .setName("partner")

        .setDescription("Crea una richiesta partnership")

        .addStringOption(option =>
            option
                .setName("link")
                .setDescription("Link invito del server partner")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("category")
                .setDescription("Categoria del server partner")
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


        const category =
            interaction.options.getString("category");


        let invite;


        try {

            invite =
                await interaction.client.fetchInvite(link);

        } catch {

            return interaction.reply({
                content:"❌ Link Discord non valido.",
                ephemeral:true
            });

        }



        const guildName =
            invite.guild?.name || "Sconosciuto";


        const description =
            invite.guild?.description || 
            "Nessuna descrizione disponibile.";



        const embed =
        new EmbedBuilder()

        .setTitle("🤝 NUOVA PARTNERSHIP")

        .setDescription(
`
━━━━━━━⚜️━━━━━━━

👤 **Autore**
${interaction.user}

📌 **Richiesta da**
${interaction.user}

🏷️ **Categoria**
${category}

🏛️ **Server**
${guildName}

📝 **Descrizione**

${description}

━━━━━━━⚜️━━━━━━━
`
        )

        .setColor("Gold")

        .setTimestamp();



        const channel =
            interaction.guild.channels.cache.get(
                PARTNER_CHANNEL
            );


        if(channel){

            await channel.send({
                embeds:[embed]
            });

        }



        await interaction.reply({

            content:
            "✅ Richiesta partnership inviata correttamente.",

            ephemeral:true

        });


    }

};
