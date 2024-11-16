import {
    EmbedBuilder,
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import { handleCheckout } from './checkout.js';

export async function getPackageInfo(packageId) {
    const TEBEX_TOKEN = process.env.TEBEX_TOKEN;
    const url = `https://headless.tebex.io/api/accounts/${TEBEX_TOKEN}/packages/${packageId}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${TEBEX_TOKEN}`,
        },
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

        const db = await open({ filename: './database/cart.sqlite', driver: sqlite3.Database });

        try {
            const row = await db.get('SELECT basket_ident FROM cart WHERE discord_id = ?', [discordId]);

            if (!row || !row.basket_ident) {
                return interaction.reply({
                    content: 'Your cart is empty. Please add packages using the /addtocart command.',
                    ephemeral: true,
                });
            }

            const packageIds = JSON.parse(row.basket_ident);

            if (packageIds.length === 0) {
                return interaction.reply({
                    content: 'Your cart is empty. Please add packages using the /addtocart command.',
                    ephemeral: true,
                });
            }

            const packageDetailsPromises = packageIds.map(async (packageId) => {
                try {
                    const packageInfo = await getPackageInfo(packageId);
                    return {
                        packageId,
                        name: packageInfo.name,
                        price: packageInfo.total_price,
                        currency: packageInfo.currency,
                        quantity: 1,
                    };
                } catch (error) {
                    console.error(`Error fetching details for package ID ${packageId}:`, error);
                    return null;
                }
            });

            const packageDetails = await Promise.all(packageDetailsPromises);
            const validPackages = packageDetails.filter((pkg) => pkg !== null);

            if (validPackages.length === 0) {
                return interaction.reply({
                    content: 'There was an error fetching your cart details. Please try again later.',
                    ephemeral: true,
                });
            }

            const totalPrice = validPackages.reduce((total, pkg) => total + pkg.price, 0);
            const currency = validPackages[0]?.currency || 'USD';

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Your Cart')
                .setDescription('The following packages are currently in your cart:');

            validPackages.forEach((pkg) => {
                embed.addFields({
                    name: `Package: ${pkg.name}`,
                    value: `ID: ${pkg.packageId}\nPrice: ${pkg.price} ${pkg.currency}\nQuantity: ${pkg.quantity}`,
                    inline: false,
                });
            });

            embed.addFields({ name: '__**Total:**__', value: `${totalPrice} ${currency}`, inline: false });

            const checkoutButton = new ButtonBuilder()
                .setLabel('Checkout')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('checkout_button');

            const buttonRow = new ActionRowBuilder().addComponents(checkoutButton);

            await interaction.reply({ embeds: [embed], components: [buttonRow] });

            const collector = interaction.channel.createMessageComponentCollector({
                filter: (i) => i.customId === 'checkout_button' && i.user.id === interaction.user.id,
                time: 60000,
            });

            collector.on('collect', async (buttonInteraction) => {
                try {
                    await buttonInteraction.deferReply({ ephemeral: true });
                    await handleCheckout(buttonInteraction);
                } catch (error) {
                    console.error('Error processing checkout button:', error);
                    try {
                        await buttonInteraction.editReply({
                            content: 'An error occurred during checkout. Please try again.',
                            ephemeral: true,
                        });
                    } catch (editError) {
                        console.error('Error sending error message for checkout:', editError);
                    }
                }
            });

            collector.on('end', async (_, reason) => {
                if (reason === 'time') {
                    try {
                        await interaction.editReply({
                            content: 'The checkout session has expired. Please view your cart and try again.',
                            components: [],
                        });
                    } catch (error) {
                        console.error('Error updating expired checkout interaction:', error);
                    }
                }
            });
        } catch (error) {
            console.error('Error viewing cart:', error);
            await interaction.reply({
                content: 'There was an error retrieving your cart. Please try again later.',
                ephemeral: true,
            });
        } finally {
            await db.close();
        }
    },
};
