const { SlashCommandBuilder } = require('discord.js');
const { getMinecraftUsername, getBasketIdent } = require('../utility/databaseHandler');
const { generateCheckoutLink } = require('../apiHandlers/checkoutHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkout')
        .setDescription('Get the checkout link for your basket.'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const discordUserId = interaction.user.id;

        try {
            const db = interaction.client.db;
            const minecraftUsername = await getMinecraftUsername(db, discordUserId);

            if (!minecraftUsername) {
                return interaction.editReply('Your username is not linked. Please use /login first.');
            }

            const basketIdent = await getBasketIdent(db, discordUserId);

            if (!basketIdent) {
                return interaction.editReply('No basket found for your account. Please link your account first.');
            }

            const checkoutLink = await generateCheckoutLink(basketIdent);

            interaction.editReply({
                content: `Here is your checkout link for your basket: [Checkout Link](${checkoutLink})`
            });
        } catch (error) {
            console.error('Error executing /checkout command:', error);
            interaction.editReply('An error occurred while processing your request.');
        }
    },
};
