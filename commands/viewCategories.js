const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchCategoriesWithPackages } = require('../apiHandlers/viewHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewcategories')
        .setDescription('View all available categories in the webstore.'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const categories = await fetchCategoriesWithPackages();

            if (!categories.length) {
                return interaction.editReply('No categories are currently available.');
            }

            const embed = new EmbedBuilder()
                .setTitle('Available Categories')
                .setColor(0x00FF00)
                .setDescription(
                    categories.map(category => `- **${category.name}**`).join('\n')
                )
                .setFooter({ text: 'Use /addpackage to add items from these categories to your basket!' });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing /viewpackages command:', error);
            interaction.editReply('An error occurred while fetching category information.');
        }
    },
};
