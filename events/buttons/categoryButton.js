const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction, client) => {
    try {
        const categoryIndex = parseInt(interaction.customId.split('_')[1], 10);
        const category = client.cachedCategories?.[categoryIndex];

        if (!category) {
            return interaction.reply({
                content: 'Category not found. Please try again.',
                ephemeral: true,
            });
        }

        if (!category.packages || category.packages.length === 0) {
            return interaction.reply({
                content: `No packages are available in the "${category.name}" category.`,
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Packages in "${category.name}"`)
            .setColor(0x00A2E8)
            .setDescription(
                category.packages
                    .map(
                        (pkg) =>
                            `- **${pkg.name}**: $${pkg.total_price.toFixed(2)} ${pkg.currency}`
                    )
                    .join('\n')
            )
            .setFooter({
                text: 'Use /addpackage to add items to your basket!',
            });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    } catch (error) {
        console.error('Error handling category button interaction:', error);
        await interaction.reply({
            content: 'An error occurred while processing your request.',
            ephemeral: true,
        });
    }
};
