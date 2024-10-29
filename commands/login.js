import { SlashCommandBuilder } from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export default {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Log in with your Minecraft username')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your Minecraft username')
                .setRequired(true)
        ),

    async execute(interaction) {
        const username = interaction.options.getString('username');

        const db = await open({ filename: './database/users.sqlite', driver: sqlite3.Database });

        await db.run('INSERT OR REPLACE INTO users (discord_id, minecraft_username) VALUES (?, ?)', [interaction.user.id, username]);

        await interaction.reply({
            content: `Your Minecraft username **${username}** has been saved!`,
            ephemeral: true
        });
    }
};
