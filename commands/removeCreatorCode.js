const { SlashCommandBuilder } = require('discord.js');
const { removeCreatorCode } = require('../apiHandlers/creatorCodeHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-creator-code')
        .setDescription('Remove the applied creator code from your basket.'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const discordUserId = interaction.user.id;
        const token = process.env.TEBEX_API_KEY;

        try {
            const db = interaction.client.db;

            const result = await removeCreatorCode({ discordUserId, db, token });

            interaction.editReply('Successfully removed the creator code from your basket.');
        } catch (error) {
            console.error('Error executing /remove-creator-code command:', error);
            interaction.editReply(error.message);
        }
    },
};
