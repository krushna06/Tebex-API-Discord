const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchCategoriesWithPackages } = require('../apiHandlers/viewHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewpackages')
        .setDescription('View all packages available in a selected category.')
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('The category to view packages from')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const selectedCategory = interaction.options.getString('category');
            const categories = await fetchCategoriesWithPackages();

            const category = categories.find(cat => cat.name.toLowerCase() === selectedCategory.toLowerCase());

            if (!category) {
                return interaction.editReply(`Category "${selectedCategory}" not found. Please ensure the name is correct.`);
            }

            if (!category.packages || category.packages.length === 0) {
                return interaction.editReply(`No packages are available in the "${category.name}" category.`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`Packages in "${category.name}"`)
                .setColor(0x00A2E8)
                .setDescription(
                    category.packages
                        .map(pkg => `- **${pkg.name}**: $${pkg.total_price.toFixed(2)} ${pkg.currency}`)
                        .join('\n')
                )
                .setFooter({ text: 'Use /addpackage to add items to your basket!' });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing /viewpackages command:', error);
            interaction.editReply('An error occurred while fetching package information.');
        }
    },
};
