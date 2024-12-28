const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interface')
        .setDescription('Show an interface with login, view cart, and view categories buttons.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Welcome to Your Store')
            .setDescription(
                'Your trusted destination for quality products.\n\n' +
                '**Here’s what you can do:**\n' +
                '- **Login** to connect your account and get personalized offers.\n' +
                '- **View Cart** to review your items before checkout.\n' +
                '- **Browse Categories** to explore our extensive collection.\n\n' +
                'Start shopping with ease!'
            )
            .setColor(0x1f8b4c)
            .setThumbnail('https://example.com/your-logo.png')
            .setFooter({ text: 'Thank you for choosing Your Store', iconURL: 'https://example.com/footer-icon.png' })

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
            .setLabel('Browse Categories')
            .setStyle(ButtonStyle.Success);

        const actionRow = new ActionRowBuilder().addComponents(
            loginButton,
            viewCartButton,
            viewCategoriesButton
        );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    },
};
