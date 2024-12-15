const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interface')
        .setDescription('Show an interface with login, view cart, and view categories buttons.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Store Interface')
            .setDescription(
                'Click **Login** to link your username, **View Cart** to see your current basket, or **View Categories** to explore the store.'
            )
            .setColor(0x00AE86);

        const loginButton = new ButtonBuilder()
            .setCustomId('login_button')
            .setLabel('Login')
            .setStyle(ButtonStyle.Primary);

        const viewCartButton = new ButtonBuilder()
            .setCustomId('view_cart_button')
            .setLabel('View Cart')
            .setStyle(ButtonStyle.Secondary);

        const viewCategoriesButton = new ButtonBuilder()
            .setCustomId('view_categories_button')
            .setLabel('View Categories')
            .setStyle(ButtonStyle.Success);

        const actionRow = new ActionRowBuilder().addComponents(
            loginButton,
            viewCartButton,
            viewCategoriesButton
        );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    },
};
