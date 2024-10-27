import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('packages')
        .setDescription('Get a list of packages from Tebex'),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const url = `https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/packages`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${TEBEX_TOKEN}` }
        });

        if (!response.ok) {
            return interaction.reply({ content: 'Failed to fetch packages information.', ephemeral: true });
        }

        const data = await response.json();
        const packages = data.data;

        if (packages.length === 0) {
            return interaction.reply({ content: 'No packages found.', ephemeral: true });
        }

        const embeds = packages.map(pkg => {
            const { id, name, description, category, base_price, total_price, currency, created_at } = pkg;

            const cleanDescription = description ? description.replace(/<\/?[^>]+(>|$)/g, "").trim() : "No description available.";

            const finalDescription = cleanDescription.length > 0 ? cleanDescription : "No description available.";

            return new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(name)
                .setURL(`https://dornox.tebex.io/packages/${id}`)
                .setDescription(finalDescription)
                .addFields(
                    { name: 'ID', value: id.toString(), inline: true },
                    { name: 'Category', value: category.name || "Unknown", inline: true },
                    { name: 'Base Price', value: `${base_price} ${currency}`, inline: true },
                    { name: 'Total Price', value: `${total_price} ${currency}`, inline: true },
                    { name: 'Created At', value: new Date(created_at).toLocaleDateString(), inline: true }
                );
        });

        await interaction.reply({ embeds });
    }
};
