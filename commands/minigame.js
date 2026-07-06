const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("minigame")
        .setDescription("🎮 Apri il menu minigame"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("🎮 Minigame Hub")
            .setDescription("Scegli un minigioco dal menu qui sotto")
            .setColor(0x2b2d31);

        const menu = new StringSelectMenuBuilder()
            .setCustomId("minigame_select")
            .setPlaceholder("Scegli un minigame")
            .addOptions([
                { label: "Dice", value: "dice", emoji: "🎲" },
                { label: "Coinflip", value: "coinflip", emoji: "🪙" },
                { label: "RPS", value: "rps", emoji: "✂️" },
                { label: "Guess", value: "guess", emoji: "🔢" },
                { label: "Reaction", value: "reaction", emoji: "⚡" },
                { label: "Slot", value: "slot", emoji: "🎰" },
                { label: "Bomb", value: "bomb", emoji: "💣" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
