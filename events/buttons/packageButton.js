const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addPackageToBasket } = require('../../apiHandlers/packageHandler');
const { getMinecraftUsername } = require('../../utility/databaseHandler');

module.exports = async (interaction, client) => {
    try {
        const [_, categoryIndex, packageIndex] = interaction.customId.split('_').map(Number);
        const category = client.cachedCategories?.[categoryIndex];
        const pkg = category?.packages?.[packageIndex];

        if (!pkg) {
            return interaction.reply({
                content: 'Package not found. Please try again.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Package Details: ${pkg.name}`)
            .setColor(0x00A2E8)
            .addFields(
                { name: 'Price', value: `$${pkg.total_price.toFixed(2)} ${pkg.currency}`, inline: true },
                { name: 'ID', value: pkg.id.toString(), inline: true },
                { name: 'Description', value: pkg.description || 'No description available.', inline: false }
            )
            .setFooter({ text: 'Click "Add to Cart" to add this item to your basket!' });

        if (pkg.image) {
            embed.setThumbnail(pkg.image);
        }

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`add_to_cart_${pkg.id}`)
                .setLabel('Add to Cart')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({
            embeds: [embed],
            components: [actionRow],
            ephemeral: true,
        });
    } catch (error) {
        console.error('Error handling package button interaction:', error);
        await interaction.reply({
            content: 'An error occurred while processing your request.',
            ephemeral: true,
        });
    }
};
