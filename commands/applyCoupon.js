const { SlashCommandBuilder } = require('discord.js');
const { applyCoupon } = require('../apiHandlers/couponHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply-coupon')
        .setDescription('Apply a coupon to your basket.')
        .addStringOption(option =>
            option
                .setName('coupon_code')
                .setDescription('The coupon code to apply')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const discordUserId = interaction.user.id;
        const couponCode = interaction.options.getString('coupon_code');
        const token = process.env.TEBEX_API_KEY;

        try {
            const db = interaction.client.db;

            const result = await applyCoupon({ discordUserId, couponCode, db, token });

            interaction.editReply(`Successfully applied coupon: ${couponCode}.`);
        } catch (error) {
            console.error('Error executing /apply-coupon command:', error);
            interaction.editReply(error.message);
        }
    },
};
