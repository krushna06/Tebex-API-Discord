import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const PACKAGE_ID = 6382065;

async function createBasket(token, username) {
    const url = `https://headless.tebex.io/api/accounts/${token}/baskets`;

    const basketData = {
        complete_url: "https://example.tebex.io/thank-you",
        cancel_url: "https://tebex.io/",
        custom: {
            foo: "bar"
        },
        complete_auto_redirect: true,
        username: username
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(basketData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create the basket: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Basket created with ident:', data.data.ident);
    return data.data.ident;
}

export default {
    data: new SlashCommandBuilder()
        .setName('checkout')
        .setDescription('Checkout with the created basket'),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
        const username = interaction.user.username;

        try {
            // Create a new basket and get the ident
            const ident = await createBasket(TEBEX_TOKEN, username);

            const url = `https://headless.tebex.io/api/baskets/${ident}/packages?username=${username}`;

            const packageData = {
                package_id: PACKAGE_ID,
                quantity: 1
            };

            console.log('Adding package to basket:', packageData);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TEBEX_TOKEN}`
                },
                body: JSON.stringify(packageData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response from adding package:', errorData);
                return interaction.reply({ content: `Failed to add package to the basket: ${errorData.message || response.statusText}`, ephemeral: true });
            }

            const data = await response.json();
            const checkoutLink = data.data.links.checkout;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Checkout Ready')
                .setDescription('You can complete your purchase using the link below:')
                .addFields({ name: 'Checkout Link', value: checkoutLink });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: error.message, ephemeral: true });
        }
    }
};
