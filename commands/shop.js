import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

// Temporary store for basket ident
const basketStore = {};

export default {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Create a new basket in the Tebex store'),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const url = `https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/baskets`;

        const basketData = {
            complete_url: "https://example.tebex.io/thank-you",
            cancel_url: "https://tebex.io/",
            custom: {
                foo: "bar"
            },
            complete_auto_redirect: true
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TEBEX_TOKEN}`
                },
                body: JSON.stringify(basketData)
            });

            if (!response.ok) {
                return interaction.reply({ content: 'Failed to create the basket.', ephemeral: true });
            }

            const data = await response.json();
            const ident = data.data.ident;
            basketStore[interaction.user.id] = ident;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Basket Created')
                .setDescription('Your new basket has been created successfully!')
                .addFields(
                    { name: 'Response', value: '```json\n' + JSON.stringify(data, null, 2) + '\n```' }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error creating the basket.', ephemeral: true });
        }
    }
};
