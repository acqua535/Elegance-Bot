const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");


const VERIFY_ROLE_ID = "1522332009773404211";
const UNVERIFIED_ROLE_ID = "1505196345009635459";


const captchaCache = new Map();



function generateCaptcha() {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 5; i++) {

        code += chars[
            Math.floor(Math.random() * chars.length)
        ];

    }

    return code;

}



module.exports = {


    data: new SlashCommandBuilder()

        .setName("verify")

        .setDescription(
            "Verifica il tuo account"
        ),



    async execute(interaction) {


        const button =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            "verify_button"
                        )

                        .setLabel(
                            "🔓 Verifica"
                        )

                        .setStyle(
                            ButtonStyle.Success
                        )

                );



        await interaction.reply({

            content:

`🔓 **Verifica Elegance**

Benvenuto nella verifica di ***Elegance Sponsoring***.

Per completare la verifica, esegui la procedura richiesta dal nostro bot.

In caso di assistenza tecnica, richieste o problemi, apri un ticket:

🎫 <#1505186342496374795>`,

            components: [
                button
            ]

        });


    },




    async buttonHandler(interaction) {


        const captcha =
            generateCaptcha();



        captchaCache.set(

            interaction.user.id,

            {

                code: captcha,

                expires:
                    Date.now() + 60000

            }

        );



        const modal =
            new ModalBuilder()

                .setCustomId(
                    "verify_modal"
                )

                .setTitle(
                    "Verifica Elegance"
                );



        const input =
            new TextInputBuilder()

                .setCustomId(
                    "captcha_input"
                )

                .setLabel(
                    `Scrivi il codice: ${captcha}`
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(
                    true
                );



        const row =
            new ActionRowBuilder()

                .addComponents(
                    input
                );



        modal.addComponents(
            row
        );



        await interaction.showModal(
            modal
        );


    },




    async modalHandler(interaction) {



        const data =
            captchaCache.get(
                interaction.user.id
            );



        if (
            !data ||
            Date.now() > data.expires
        ) {


            captchaCache.delete(
                interaction.user.id
            );


            return interaction.reply({

                content:
                    "❌ CAPTCHA scaduto. Riprova.",

                ephemeral: true

            });


        }




        const answer =
            interaction.fields.getTextInputValue(
                "captcha_input"
            );



        if (
            answer !== data.code
        ) {


            return interaction.reply({

                content:
                    "❌ Codice errato.",

                ephemeral: true

            });


        }




        const member =
            interaction.member;



        const verifiedRole =
            interaction.guild.roles.cache.get(
                VERIFY_ROLE_ID
            );


        const unverifiedRole =
            interaction.guild.roles.cache.get(
                UNVERIFIED_ROLE_ID
            );




        try {


            if (unverifiedRole) {


                await member.roles.remove(
                    unverifiedRole
                );


            }



            if (verifiedRole) {


                await member.roles.add(
                    verifiedRole
                );


            }



            captchaCache.delete(
                interaction.user.id
            );



            await interaction.reply({

                content:
                    "✅ Verifica completata! Benvenuto in Elegance Sponsoring.",

                ephemeral: true

            });



        } catch(error) {


            console.error(
                error
            );


            await interaction.reply({

                content:
                    "❌ Errore durante la verifica. Contatta lo staff.",

                ephemeral: true

            });


        }


    }


};
