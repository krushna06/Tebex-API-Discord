const { SlashCommandBuilder } = require('discord.js');
const { applyGiftCard } = require('../apiHandlers/giftCardHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply-gift-card')
        .setDescription('Apply a gift card to your basket.')
        .addStringOption(option =>
            option
                .setName('card_number')
                .setDescription('The gift card number to apply')
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

            const result = await applyGiftCard({ discordUserId, giftCardNumber, db, token });

            await interaction.editReply(`Successfully applied gift card: ${giftCardNumber}.`);
        } catch (error) {
            console.error('Error executing /apply-gift-card command:', error);

            const userFriendlyMessage = error.message || 'An unexpected error occurred. Please try again later.';
            await interaction.editReply({ content: userFriendlyMessage, ephemeral: true });
        }
    },
};
