const { SlashCommandBuilder } = require('discord.js');
const { removeUser } = require('../utility/databaseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logout')
        .setDescription('Log out and unlink your Minecraft username.'),
    async execute(interaction) {
        const discordUserId = interaction.user.id;

        try {
            await removeUser(interaction.client.db, discordUserId);
            interaction.reply({ content: 'You have been logged out successfully.', ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'An error occurred while logging out.', ephemeral: true });
        }
    }
};
