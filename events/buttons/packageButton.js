const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { htmlToText } = require('html-to-text');

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

        const descriptionText = pkg.description
            ? htmlToText(pkg.description, { wordwrap: 130 })
            : 'No description available.';

        const embed = new EmbedBuilder()
            .setTitle(`Package Details: ${pkg.name}`)
            .setColor(0x00A2E8)
            .addFields(
                { name: 'Price', value: `$${pkg.total_price.toFixed(2)} ${pkg.currency}`, inline: true },
                { name: 'ID', value: pkg.id.toString(), inline: true },
                { 
                    name: 'Description', 
                    value: descriptionText.length > 1024 
                        ? `${descriptionText.slice(0, 1021)}...` 
                        : descriptionText, 
                    inline: false 
                }
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
