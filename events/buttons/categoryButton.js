const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
                    .map((pkg, index) => `**${index + 1}** - ${pkg.name}`)
                    .join('\n')
            )
            .setFooter({
                text: 'Click a button below to view details of the corresponding package.',
            });

        const actionRows = [];
        let currentRow = new ActionRowBuilder();

        category.packages.forEach((pkg, index) => {
            const button = new ButtonBuilder()
                .setCustomId(`package_${categoryIndex}_${index}`)
                .setLabel((index + 1).toString())
                .setStyle(ButtonStyle.Primary);

            if (currentRow.components.length < 5) {
                currentRow.addComponents(button);
            } else {
                actionRows.push(currentRow);
                currentRow = new ActionRowBuilder().addComponents(button);
            }
        });

        if (currentRow.components.length > 0) actionRows.push(currentRow);

        await interaction.reply({
            embeds: [embed],
            components: actionRows,
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
