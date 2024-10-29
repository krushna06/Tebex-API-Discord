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
                discord_id TEXT,
                package_id INTEGER,
                PRIMARY KEY (discord_id, package_id)
            )
        `);

        await db.run('INSERT OR REPLACE INTO cart (discord_id, package_id) VALUES (?, ?)', [discordId, packageId]);

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Package Added to Cart')
            .setDescription(`Package ID **${packageId}** has been added to your cart.`);

        await interaction.reply({ embeds: [embed] });
    }
};
