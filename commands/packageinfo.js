import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('packageinfo')
        .setDescription('Get detailed information about a package from Tebex')
        .addStringOption(option => 
            option.setName('package_id')
                .setDescription('The ID of the package')
                .setRequired(true)
        ),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const packageId = interaction.options.getString('package_id');

        const url = `https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/packages/${packageId}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${TEBEX_TOKEN}` }
        });

        if (!response.ok) {
            return interaction.reply({ content: 'Failed to fetch package information.', ephemeral: true });
        }

        const data = await response.json();
        const packageData = data.data;

        let description = packageData.description || "No description available.";
        description = description.replace(/<\/?[^>]+(>|$)/g, "");

        // Create the embed
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(packageData.name)
            .setDescription(description || "No description available.")
            .addFields(
                { name: 'ID', value: packageData.id.toString(), inline: true },
                { name: 'Category', value: packageData.category.name || "Unknown", inline: true },
                { name: 'Base Price', value: `${packageData.base_price} ${packageData.currency}`, inline: true },
                { name: 'Total Price', value: `${packageData.total_price} ${packageData.currency}`, inline: true },
                { name: 'Created At', value: new Date(packageData.created_at).toLocaleDateString(), inline: true },
                { name: 'Updated At', value: new Date(packageData.updated_at).toLocaleDateString(), inline: true }
            );

        if (packageData.image) {
            embed.setImage(packageData.image);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
