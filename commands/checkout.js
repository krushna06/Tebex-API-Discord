const { SlashCommandBuilder } = require('discord.js');
const { getMinecraftUsername, getBasketIdent } = require('../utility/databaseHandler');
const { generateCheckoutLink } = require('../apiHandlers/checkoutHandler');
const { generateRazorpayLink } = require('../apiHandlers/razorpayHandler');

const enableRazorpay = process.env.RAZORPAY === 'true';

module.exports = {
    data: (() => {
        const command = new SlashCommandBuilder()
            .setName('checkout')
            .setDescription('Get the checkout link for your basket.')
            .addStringOption(option => {
                option
                    .setName('type')
                    .setDescription('Choose the payment type')
                    .setRequired(true);

                option.addChoices({ name: 'Tebex', value: 'tebex' });
                if (enableRazorpay) {
                    option.addChoices({ name: 'Razorpay (UPI)', value: 'razorpay' });
                }
                return option;
            });
        return command;
    })(),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const discordUserId = interaction.user.id;
        const paymentType = interaction.options.getString('type');

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

            let checkoutLink;

            if (paymentType === 'tebex') {
                checkoutLink = await generateCheckoutLink(basketIdent);
            } else if (paymentType === 'razorpay') {
                if (!enableRazorpay) {
                    return interaction.editReply('Razorpay is currently disabled.');
                }
                checkoutLink = await generateRazorpayLink(basketIdent, process.env.TEBEX_TOKEN);
            } else {
                return interaction.editReply('Invalid payment type selected.');
            }

            interaction.editReply({
                content: `Here is your checkout link for your basket using ${paymentType}: [Checkout Link](${checkoutLink})`
            });
        } catch (error) {
            console.error('Error executing /checkout command:', error);
            interaction.editReply('An error occurred while processing your request.');
        }
    },
};
