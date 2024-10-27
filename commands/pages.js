import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pages')
        .setDescription('Get list of custom pages from Tebex'),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const response = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/pages`, {
            headers: { Authorization: `Bearer ${TEBEX_TOKEN}` }
        });

        if (!response.ok) {
            return interaction.reply({ content: 'Failed to fetch pages information.', ephemeral: true });
        }

        const data = await response.json();
        const pages = data.data;

        if (pages.length === 0) {
            return interaction.reply({ content: 'No pages found.', ephemeral: true });
        }

        const embeds = pages.map(page => {
            const { title, slug, content, created_at } = page;

            return new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(title)
                .setURL(`https://dornox.tebex.io/pages/${slug}`)
                .setDescription(content.replace(/<\/?[^>]+(>|$)/g, "")) // Remove HTML tags
                .addFields(
                    { name: 'Slug', value: slug, inline: true },
                    { name: 'Created At', value: new Date(created_at).toLocaleDateString(), inline: true }
                );
        });

        await interaction.reply({ embeds });
    }
};
