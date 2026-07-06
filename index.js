require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Events
} = require("discord.js");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});


client.once(Events.ClientReady, () => {

    console.log(
        `✅ Online come ${client.user.tag}`
    );

});


client.login(process.env.TOKEN);
