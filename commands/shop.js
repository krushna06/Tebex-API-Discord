import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

function formatDescription(html) {
    let formatted = html.replace(/<\/?p>/g, '\n');

    formatted = formatted.replace(/<img [^>]*src="([^"]+)"[^>]*>/g, '[Image Link]($1)');

    formatted = formatted.replace(/<[^>]+>/g, '');

    return formatted.trim();
}

export default {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse packages by category'),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const url = `https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/categories?includePackages=1`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${TEBEX_TOKEN}` }
        });

        if (!response.ok) {
            return interaction.reply({ content: 'Failed to fetch categories information.', ephemeral: true });
        }

        const data = await response.json();
        const categories = data.data;

        if (categories.length === 0) {
            return interaction.reply({ content: 'No categories found.', ephemeral: true });
        }

        const buttons = [];
        let categoryList = '';

        categories.forEach((category, index) => {
            const { id, name } = category;
            categoryList += `${index + 1}. ${name}\n`;

            buttons.push(
                new ButtonBuilder()
                    .setCustomId(`category_${id}`)
                    .setLabel((index + 1).toString())
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Categories')
            .setDescription('Browse through the categories below and select one to view packages.')
            .addFields({ name: 'Available Categories', value: categoryList });

        const row = new ActionRowBuilder().addComponents(buttons);

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (btnInteraction) => {
            const customIdParts = btnInteraction.customId.split('_');

            if (customIdParts[0] === 'category') {
                const categoryId = customIdParts[1];
                const selectedCategory = categories.find(cat => cat.id.toString() === categoryId);

                if (!selectedCategory || !selectedCategory.packages || selectedCategory.packages.length === 0) {
                    return btnInteraction.reply({ content: 'No packages found for this category.', ephemeral: true });
                }

                const packageButtons = [];
                const packageListEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`Packages in Category: ${selectedCategory.name}`)
                    .setDescription('Select a package below to view more details.');

                selectedCategory.packages.forEach((pkg, index) => {
                    packageListEmbed.addFields({
                        name: `${index + 1}. ${pkg.name}`,
                        value: `${pkg.base_price} ${pkg.currency} - [View Package](https://dornox.tebex.io/package/${pkg.id})`
                    });

                    packageButtons.push(
                        new ButtonBuilder()
                            .setCustomId(`package_${pkg.id}`)
                            .setLabel((index + 1).toString())
                            .setStyle(ButtonStyle.Secondary)
                    );
                });

                const packageRow = new ActionRowBuilder().addComponents(packageButtons);

                await btnInteraction.reply({ embeds: [packageListEmbed], components: [packageRow], ephemeral: true });
            }

            if (customIdParts[0] === 'package') {
                const packageId = customIdParts[1];
                const selectedCategory = categories.find(cat => cat.packages.some(pkg => pkg.id.toString() === packageId));
                const selectedPackage = selectedCategory.packages.find(pkg => pkg.id.toString() === packageId);

                if (!selectedPackage) {
                    return btnInteraction.reply({ content: 'Package details could not be found.', ephemeral: true });
                }

                const formattedDescription = formatDescription(selectedPackage.description || 'No description available.');
                const packageImage = selectedPackage.image || null;

                const packageDetailEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`Package: ${selectedPackage.name}`)
                    .setDescription(formattedDescription)
                    .addFields(
                        { name: 'Price', value: `${selectedPackage.base_price} ${selectedPackage.currency}`, inline: true },
                        { name: 'Category', value: selectedPackage.category.name, inline: true },
                        { name: 'Created At', value: new Date(selectedPackage.created_at).toLocaleDateString(), inline: false }
                    )
                    .setFooter({ text: `ID: ${selectedPackage.id}` });

                if (packageImage) {
                    packageDetailEmbed.setImage(packageImage);
                }

                await btnInteraction.reply({ embeds: [packageDetailEmbed], ephemeral: true });
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] });
        });
    }
};
