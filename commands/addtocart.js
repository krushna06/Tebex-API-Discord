import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export default {
    data: new SlashCommandBuilder()
        .setName('addtocart')
        .setDescription('Add a package ID to your cart.')
        .addIntegerOption(option =>
            option.setName('package_id')
                .setDescription('The ID of the package to add to the cart')
                .setRequired(true)),

    async execute(interaction) {
        const packageId = interaction.options.getInteger('package_id');
        const discordId = interaction.user.id;

        const db = await open({ filename: './database/cart.sqlite', driver: sqlite3.Database });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS cart (
                discord_id TEXT PRIMARY KEY,
                basket_ident TEXT NOT NULL
            )
        `);

        try {
            const row = await db.get('SELECT basket_ident FROM cart WHERE discord_id = ?', [discordId]);

            let basket;
            if (row) {
                basket = JSON.parse(row.basket_ident);
                if (basket.includes(packageId)) {
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Package Already in Cart')
                        .setDescription(`Package ID **${packageId}** is already in your cart.`);

                    await interaction.reply({ embeds: [embed] });
                    return;
                }
            } else {
                basket = [];
            }

            basket.push(packageId);

            const basketString = JSON.stringify(basket);
            if (row) {
                await db.run('UPDATE cart SET basket_ident = ? WHERE discord_id = ?', [basketString, discordId]);
            } else {
                await db.run('INSERT INTO cart (discord_id, basket_ident) VALUES (?, ?)', [discordId, basketString]);
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Package Added to Cart')
                .setDescription(`Package ID **${packageId}** has been added to your cart.`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error adding package to cart:', error);
            await interaction.reply({ content: 'There was an error adding the package to your cart. Please try again.', ephemeral: true });
        } finally {
            await db.close();
        }
    }
};
