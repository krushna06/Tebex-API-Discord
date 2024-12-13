const { SlashCommandBuilder } = require('discord.js');
const { removeCoupon } = require('../apiHandlers/couponHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-coupon')
        .setDescription('Remove a coupon from your basket.')
        .addStringOption(option =>
            option
                .setName('coupon_code')
                .setDescription('The coupon code to remove from your basket.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const discordUserId = interaction.user.id;
        const couponCode = interaction.options.getString('coupon_code');
        const token = process.env.TEBEX_API_KEY;

        try {
            const db = interaction.client.db;

            await removeCoupon({ discordUserId, couponCode, db, token });

            interaction.editReply(`Successfully removed the coupon: ${couponCode} from your basket.`);
        } catch (error) {
            console.error('Error executing /remove-coupon command:', error);
            interaction.editReply(error.message);
        }
    },
};
