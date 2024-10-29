import fetch from 'node-fetch';
import { SlashCommandBuilder } from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a package from your cart')
        .addIntegerOption(option =>
            option.setName('package_id')
                .setDescription('The ID of the package to remove')
                .setRequired(true)),

    async execute(interaction) {
        const TEBEX_TOKEN = process.env.TEBEX_TOKEN;

        const packageId = interaction.options.getInteger('package_id');

        const usersDb = await open({ filename: './database/users.sqlite', driver: sqlite3.Database });
        const user = await usersDb.get('SELECT minecraft_username FROM users WHERE discord_id = ?', [interaction.user.id]);

        if (!user) {
            return interaction.reply({ content: 'You need to log in with your Minecraft username using the /login command first.', ephemeral: true });
        }

        const username = user.minecraft_username;

        const cartDb = await open({ filename: './database/cart.sqlite', driver: sqlite3.Database });
        const cartItem = await cartDb.get('SELECT basket_ident FROM cart WHERE discord_id = ?', [interaction.user.id]);

        if (!cartItem) {
            return interaction.reply({ content: 'Your cart is empty. Please add a package using the /addtocart command.', ephemeral: true });
        }

        const basketIdent = cartItem.basket_ident;

        const url = `https://headless.tebex.io/api/baskets/${basketIdent}/packages/remove`;

        const removePackageData = {
            package_id: packageId
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TEBEX_TOKEN}`
                },
                body: JSON.stringify(removePackageData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response from removing package:', errorData);
                return interaction.reply({ content: `Failed to remove package: ${errorData.message || response.statusText}`, ephemeral: true });
            }

            await cartDb.run('DELETE FROM cart WHERE discord_id = ? AND package_id = ?', [interaction.user.id, packageId]);

            await interaction.reply({ content: `Package with ID ${packageId} has been successfully removed from your cart.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `There was an error removing the package: ${error.message}`, ephemeral: true });
        } finally {
            await usersDb.close();
            await cartDb.close();
        }
    }
};
