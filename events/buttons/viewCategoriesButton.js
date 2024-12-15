const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchCategoriesWithPackages } = require('../../apiHandlers/viewHandler');

module.exports = async (interaction, client) => {
    try {
        const categories = await fetchCategoriesWithPackages();

        if (!categories.length) {
            return interaction.reply({
                content: 'No categories are currently available.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Available Categories')
            .setColor(0x00FF00)
            .setDescription(
                categories
                    .map((category, index) => `${index + 1} - **${category.name}**`)
                    .join('\n')
            )
            .setFooter({
                text: 'Click a button below to view packages in the corresponding category.',
            });

        const actionRow = new ActionRowBuilder();
        categories.forEach((category, index) => {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`category_${index}`)
                    .setLabel(`${index + 1}`)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        await interaction.reply({
            embeds: [embed],
            components: [actionRow],
            ephemeral: true,
        });

        client.cachedCategories = categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        await interaction.reply({
            content: 'An error occurred while fetching category information.',
            ephemeral: true,
        });
    }
};
