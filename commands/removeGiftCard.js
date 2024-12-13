const { SlashCommandBuilder } = require('discord.js');
const { removeGiftCard } = require('../apiHandlers/giftCardHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-gift-card')
        .setDescription('Remove a gift card from your basket.')
        .addStringOption(option =>
            option
                .setName('card_number')
                .setDescription('The gift card number to remove')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const discordUserId = interaction.user.id;
        const giftCardNumber = interaction.options.getString('card_number');
        const token = process.env.TEBEX_API_KEY;

        if (!token) {
            await interaction.editReply({ content: 'Tebex API token is missing. Please contact an administrator.', ephemeral: true });
            return;
        }

        try {
            const db = interaction.client.db;

            const result = await removeGiftCard({ discordUserId, giftCardNumber, db, token });

            await interaction.editReply(`Successfully removed gift card: ${giftCardNumber} from your basket.`);
        } catch (error) {
            console.error('Error executing /remove-gift-card command:', error);

            const userFriendlyMessage = error.message || 'An unexpected error occurred. Please try again later.';
            await interaction.editReply({ content: userFriendlyMessage, ephemeral: true });
        }
    },
};
