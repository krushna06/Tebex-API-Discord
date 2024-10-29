import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

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

        const embeds = [];
        const buttons = [];

        categories.forEach((category) => {
            const { id, name } = category;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(name)
                .setDescription('Click a button to view packages in this category.')
                .addFields(
                    { name: 'ID', value: id.toString(), inline: true }
                );

            embeds.push(embed);

            buttons.push(
                new ButtonBuilder()
                    .setCustomId(`category_${id}`)
                    .setLabel(name)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const row = new ActionRowBuilder().addComponents(buttons);

        await interaction.reply({ embeds: [embeds[0]], components: [row] });

        const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (btnInteraction) => {
            const categoryId = btnInteraction.customId.split('_')[1];
            const selectedCategory = categories.find(cat => cat.id.toString() === categoryId);

            if (!selectedCategory || !selectedCategory.packages) {
                return btnInteraction.reply({ content: 'No packages found for this category.', ephemeral: true });
            }

            const { packages } = selectedCategory;

            if (packages.length === 0) {
                return btnInteraction.reply({ content: 'No packages found in this category.', ephemeral: true });
            }

            const packageEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`Packages in Category: ${selectedCategory.name}`)
                .setDescription('Here are the packages available in this category:')
                .addFields(packages.map(pkg => ({
                    name: pkg.name,
                    value: `${pkg.base_price} ${pkg.currency} - [View Package](https://dornox.tebex.io/package/${pkg.id})`,
                    inline: false
                })));

            await btnInteraction.reply({ embeds: [packageEmbed], ephemeral: true });
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] });
        });
    }
};
