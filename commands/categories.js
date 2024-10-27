import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('categories')
        .setDescription('Get the list of categories from Tebex')
        .addBooleanOption(option => 
            option.setName('show_packages')
                .setDescription('Include packages in the response')
                .setRequired(false)
        ),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const showPackages = interaction.options.getBoolean('show_packages');
        const url = showPackages 
            ? `https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/categories?includePackages=1`
            : `https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/categories`;

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

        const embeds = categories.map(category => {
            const { id, name, slug, description, packages } = category;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(name)
                .setDescription(description || 'No description available')
                .addFields(
                    { name: 'ID', value: id.toString(), inline: true },
                    { name: 'Slug', value: slug || 'No slug available', inline: true }
                );

            if (showPackages && packages.length > 0) {
                embed.addFields({ name: 'Packages', value: packages.map(pkg => pkg.name).join(', ') || 'No packages available', inline: false });
            }

            return embed;
        });

        await interaction.reply({ embeds });
    }
};
