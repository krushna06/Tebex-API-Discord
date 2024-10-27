import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('categories')
        .setDescription('Get the list of categories from Tebex'),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const response = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/categories`, {
            headers: { Authorization: `Bearer ${TEBEX_TOKEN}` }
        });

        if (!response.ok) {
            return interaction.reply({ content: 'Failed to fetch categories.', ephemeral: true });
        }

        const data = await response.json();
        const categories = data.data;

        if (categories.length === 0) {
            return interaction.reply({ content: 'No categories found.', ephemeral: true });
        }

        const embeds = categories.map(category => {
            const { id, name, slug, description } = category;

            return new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(name)
                .setDescription(description || 'No description available')
                .addFields(
                    { name: 'ID', value: id.toString(), inline: true },
                    { name: 'Slug', value: slug || 'No slug available', inline: true }
                );
        });

        await interaction.reply({ embeds });
    }
};
