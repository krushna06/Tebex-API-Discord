const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interface')
        .setDescription('Show an interface with login and view cart buttons.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Login Interface')
            .setDescription('Click **Login** to link your username, or **View Cart** to see your current basket.')
            .setColor(0x00AE86);

        const loginButton = new ButtonBuilder()
            .setCustomId('login_button')
            .setLabel('Login')
            .setStyle(ButtonStyle.Primary);

        const viewCartButton = new ButtonBuilder()
            .setCustomId('view_cart_button')
            .setLabel('View Cart')
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder().addComponents(loginButton, viewCartButton);

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    },
};
