const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchCategoriesWithPackages } = require('../../apiHandlers/viewHandler');

const generatePageContent = (categories, page) => {
    const categoriesPerPage = 10;
    const start = page * categoriesPerPage;
    const end = start + categoriesPerPage;
    const currentCategories = categories.slice(start, end);

    const embed = new EmbedBuilder()
        .setTitle('Available Categories')
        .setColor(0x00FF00)
        .setDescription(
            currentCategories
                .map((category, index) => `${start + index + 1} - **${category.name}**`)
                .join('\n')
        )
        .setFooter({
            text: 'Click a button below to view packages in the corresponding category.',
        });

    const actionRows = [];
    let firstRow = new ActionRowBuilder();
    let secondRow = new ActionRowBuilder();

    currentCategories.forEach((category, index) => {
        const button = new ButtonBuilder()
            .setCustomId(`category_${start + index}`)
            .setLabel(`${start + index + 1}`)
            .setStyle(ButtonStyle.Primary);

        if (index < 5) {
            firstRow.addComponents(button);
        } else {
            secondRow.addComponents(button);
        }
    });

    if (firstRow.components.length > 0) actionRows.push(firstRow);
    if (secondRow.components.length > 0) actionRows.push(secondRow);

    const navRow = new ActionRowBuilder();
    if (page > 0) {
        navRow.addComponents(
            new ButtonBuilder()
                .setCustomId('previous_page')
                .setLabel('Back')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    if (end < categories.length) {
        navRow.addComponents(
            new ButtonBuilder()
                .setCustomId('next_page')
                .setLabel('Next')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    if (navRow.components.length > 0) actionRows.push(navRow);

    return { embed, actionRows };
};

module.exports = async (interaction, client) => {
    try {
        await interaction.deferReply({ ephemeral: true });

        const categories = await fetchCategoriesWithPackages();

        if (!categories.length) {
            return interaction.editReply({
                content: 'No categories are currently available.',
            });
        }

        const currentPage = 0;
        const { embed, actionRows } = generatePageContent(categories, currentPage);

        await interaction.editReply({
            embeds: [embed],
            components: actionRows,
        });

        client.cachedCategories = categories;
        client.currentPage = currentPage;
    } catch (error) {
        console.error('Error fetching categories:', error);

        await interaction.editReply({
            content: 'An error occurred while fetching category information.',
        });
    }
};

module.exports.generatePageContent = generatePageContent;
