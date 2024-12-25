const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchCategoriesWithPackages } = require('../apiHandlers/viewHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewpackage')
        .setDescription('View detailed information about a specific package.')
        .addStringOption(option =>
            option
                .setName('identifier')
                .setDescription('The name or ID of the package to view.')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const identifier = interaction.options.getString('identifier').toLowerCase();
            const categories = await fetchCategoriesWithPackages();

            let foundPackage = null;

            for (const category of categories) {
                const matchingPackage = category.packages.find(
                    pkg =>
                        pkg.name.toLowerCase() === identifier || pkg.id.toString() === identifier
                );
                if (matchingPackage) {
                    foundPackage = matchingPackage;
                    break;
                }
            }

            if (!foundPackage) {
                return interaction.editReply(`No package found with the name or ID "${identifier}".`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`Package Details: ${foundPackage.name}`)
                .setColor(0x00A2E8)
                .addFields(
                    { name: 'Price', value: `$${foundPackage.total_price.toFixed(2)} ${foundPackage.currency}`, inline: true },
                    { name: 'ID', value: foundPackage.id.toString(), inline: true },
                    { name: 'Description', value: foundPackage.description || 'No description available.', inline: false }
                )
                .setFooter({ text: 'Use /addpackage to add this item to your basket!' });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing /viewpackage command:', error);
            interaction.editReply('An error occurred while fetching package information.');
        }
    },
};
