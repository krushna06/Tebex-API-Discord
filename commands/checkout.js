import fetch from 'node-fetch';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { getPackageInfo } from './viewcart.js';

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

export async function handleCheckout(interaction) {
    const TEBEX_TOKEN = process.env.TEBEX_TOKEN;

    const usersDb = await open({ filename: './database/users.sqlite', driver: sqlite3.Database });
    const user = await usersDb.get('SELECT minecraft_username FROM users WHERE discord_id = ?', [interaction.user.id]);

    if (!user) {
        throw new Error('You need to log in with your Minecraft username using the /login command first.');
    }

    const username = user.minecraft_username;

    const cartDb = await open({ filename: './database/cart.sqlite', driver: sqlite3.Database });
    const row = await cartDb.get('SELECT basket_ident FROM cart WHERE discord_id = ?', [interaction.user.id]);

    if (!row || !row.basket_ident) {
        throw new Error('Your cart is empty. Please add packages using the /addtocart command.');
    }

    const packageIds = JSON.parse(row.basket_ident);

    if (packageIds.length === 0) {
        throw new Error('Your cart is empty. Please add packages using the /addtocart command.');
    }

    const packageDetailsPromises = packageIds.map(async (packageId) => {
        try {
            const packageInfo = await getPackageInfo(packageId);
            return {
                packageId,
                name: packageInfo.name,
                price: packageInfo.total_price,
                currency: packageInfo.currency,
                quantity: 1
            };
        } catch (error) {
            console.error(`Error fetching details for package ID ${packageId}:`, error);
            return null;
        }
    });

    const packageDetails = await Promise.all(packageDetailsPromises);
    const validPackages = packageDetails.filter((pkg) => pkg !== null);

    if (validPackages.length === 0) {
        throw new Error('There was an error fetching your cart details. Please try again later.');
    }

    const totalPrice = validPackages.reduce((total, pkg) => total + pkg.price, 0);
    const currency = validPackages[0]?.currency || 'USD';

    const ident = await createBasket(TEBEX_TOKEN, username);

    const url = `https://headless.tebex.io/api/baskets/${ident}/packages`;

    const packageAddPromises = packageIds.map(async (packageId) => {
        const packageData = {
            package_id: packageId,
            quantity: 1,
            username: username
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TEBEX_TOKEN}`
            },
            body: JSON.stringify(packageData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to add package ID ${packageId} to the basket: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    });

    const results = await Promise.all(packageAddPromises);

    const checkoutLink = results[0].data.links.checkout;

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
}

export default {
    data: new SlashCommandBuilder()
        .setName('checkout')
        .setDescription('Checkout with the created basket'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            await handleCheckout(interaction);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: error.message, ephemeral: true });
        }
    }
};
