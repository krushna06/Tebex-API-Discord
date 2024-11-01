import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export default {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Log in with your Minecraft username'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('loginModal')
            .setTitle('Minecraft Login');

        const usernameInput = new TextInputBuilder()
            .setCustomId('username')
            .setLabel("Enter your Minecraft username")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(usernameInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }
};
