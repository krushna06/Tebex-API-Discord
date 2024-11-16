import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';

async function getPackageInfo(packageId) {
    const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
    const url = `https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/packages/${packageId}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${TEBEX_TOKEN}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch package information for package ID: ${packageId}`);
    }

    const data = await response.json();
    return data.data;
}

export default {
    data: new SlashCommandBuilder()
        .setName('viewcart')
        .setDescription('View the contents of your cart.'),

    async execute(interaction) {
        const discordId = interaction.user.id;

        // Open the cart database
        const db = await open({ filename: './database/cart.sqlite', driver: sqlite3.Database });

        try {
            // Retrieve the basket_ident from the cart table for the user
            const row = await db.get('SELECT basket_ident FROM cart WHERE discord_id = ?', [discordId]);

            if (!row || !row.basket_ident) {
                return interaction.reply({ content: 'Your cart is empty. Please add packages using the /addtocart command.', ephemeral: true });
            }

            // Parse the basket_ident to get the list of package IDs
            const packageIds = JSON.parse(row.basket_ident);

            if (packageIds.length === 0) {
                return interaction.reply({ content: 'Your cart is empty. Please add packages using the /addtocart command.', ephemeral: true });
            }

            // Fetch details for each package
            const packageDetailsPromises = packageIds.map(async (packageId) => {
                try {
                    const packageInfo = await getPackageInfo(packageId);
                    return {
                        packageId,
                        name: packageInfo.name,
                        price: packageInfo.total_price,
                        currency: packageInfo.currency,
                        quantity: 1 // Assuming each package is added once, modify this if quantity varies
                    };
                } catch (error) {
                    console.error(`Error fetching details for package ID ${packageId}:`, error);
                    return null; // If there's an error fetching details, return null for that package
                }
            });

            const packageDetails = await Promise.all(packageDetailsPromises);
            const validPackages = packageDetails.filter((pkg) => pkg !== null); // Remove any packages with errors

            if (validPackages.length === 0) {
                return interaction.reply({ content: 'There was an error fetching your cart details. Please try again later.', ephemeral: true });
            }

            // Calculate the total price
            const totalPrice = validPackages.reduce((total, pkg) => total + pkg.price, 0);
            const currency = validPackages[0]?.currency || 'USD'; // Assuming the first valid package's currency

            // Create the embed for the cart
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Your Cart')
                .setDescription('The following packages are currently in your cart:');

            // Add fields for each package
            validPackages.forEach(pkg => {
                embed.addFields(
                    { name: `Package: ${pkg.name}`, value: `ID: ${pkg.packageId}\nPrice: ${pkg.price} ${pkg.currency}\nQuantity: ${pkg.quantity}`, inline: false }
                );
            });

            // Add the total price at the bottom
            embed.addFields(
                { name: '__**Total:**__', value: `${totalPrice} ${currency}`, inline: false }
            );

            // Create a checkout button that will trigger the /checkout command
            const checkoutButton = new ButtonBuilder()
                .setLabel('Checkout')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('checkout_button'); // Custom ID for the button

            // Create an action row for the button
            const buttonRow = new ActionRowBuilder().addComponents(checkoutButton);

            // Send the embed with the checkout button
            await interaction.reply({ embeds: [embed], components: [buttonRow] });
        } catch (error) {
            console.error('Error viewing cart:', error);
            await interaction.reply({ content: 'There was an error retrieving your cart. Please try again later.', ephemeral: true });
        } finally {
            await db.close();
        }
    }
};
