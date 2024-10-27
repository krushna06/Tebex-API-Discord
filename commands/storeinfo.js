import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('storeinfo')
        .setDescription('Get store information from Tebex'),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const response = await fetch(`https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}`, {
            headers: { Authorization: `Bearer ${TEBEX_TOKEN}` }
        });

        if (!response.ok) {
            return interaction.reply({ content: 'Failed to fetch store information.', ephemeral: true });
        }

        const data = await response.json();
        const { id, name, description, webstore_url, currency, lang, platform_type, created_at } = data.data;

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`${name} Store Information`)
            .setDescription(description.replace(/<\/?[^>]+(>|$)/g, "")) // Remove HTML tags
            .addFields(
                { name: 'Webstore URL', value: webstore_url, inline: true },
                { name: 'Currency', value: currency, inline: true },
                { name: 'Language', value: lang, inline: true },
                { name: 'Platform', value: platform_type, inline: true },
                { name: 'Store Created', value: new Date(created_at).toLocaleDateString(), inline: true }
            )
            .setFooter({ text: `Store ID: ${id}` });

        await interaction.reply({ embeds: [embed] });
    }
};
