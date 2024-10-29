import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

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

        const usersDb = await open({ filename: './database/users.sqlite', driver: sqlite3.Database });
        const user = await usersDb.get('SELECT minecraft_username FROM users WHERE discord_id = ?', [interaction.user.id]);

        if (!user) {
            return interaction.reply({ content: 'You need to log in with your Minecraft username using the /login command first.', ephemeral: true });
        }

        const username = user.minecraft_username;

        const cartDb = await open({ filename: './database/cart.sqlite', driver: sqlite3.Database });
        const cartItems = await cartDb.all('SELECT package_id FROM cart WHERE discord_id = ?', [interaction.user.id]);

        if (cartItems.length === 0) {
            return interaction.reply({ content: 'Your cart is empty. Please add a package using the /addtocart command.', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const ident = await createBasket(TEBEX_TOKEN, username);

            await cartDb.run('UPDATE cart SET basket_ident = ? WHERE discord_id = ?', [ident, interaction.user.id]);

            const url = `https://headless.tebex.io/api/baskets/${ident}/packages`;

            const packageAddPromises = cartItems.map(async (item) => {
                const packageData = {
                    package_id: item.package_id,
                    quantity: 1,
                    username: username
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
                    throw new Error(`Failed to add package ID ${item.package_id} to the basket: ${errorData.message || response.statusText}`);
                }

                return await response.json();
            });

            const results = await Promise.all(packageAddPromises);

            const checkoutLink = results[0].data.links.checkout;
            const totalPrice = results.reduce((total, res) => total + res.data.total_price, 0);
            const currency = results[0].data.currency;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Checkout Ready')
                .setDescription('You can complete your purchase using the link below:')
                .addFields(
                    { name: 'Username', value: username, inline: true },
                    { name: 'Total Price', value: `${totalPrice} ${currency}`, inline: true },
                    { name: 'Checkout Link', value: checkoutLink }
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: error.message, ephemeral: true });
        } finally {
            await usersDb.close();
            await cartDb.close();
        }
    }
};
