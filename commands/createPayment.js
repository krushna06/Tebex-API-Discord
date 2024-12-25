const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { TEBEX_SECRET_KEY, ADMIN_ROLE_ID } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createpayment')
        .setDescription('Create a manual payment on Tebex')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username of the user to apply the payment to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('The price of the payment')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('package_id')
                .setDescription('The ID of the package to include in the payment')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('note')
                .setDescription('A note to assign to the payment')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const hasPermission = interaction.member.roles.cache.has(ADMIN_ROLE_ID);
        if (!hasPermission) {
            return interaction.editReply({
                content: 'You do not have permission to use this command.',
            });
        }

        const username = interaction.options.getString('username');
        const price = interaction.options.getInteger('price');
        const packageId = interaction.options.getInteger('package_id');
        const note = interaction.options.getString('note') || 'Manual payment created via Discord bot';

        const tebexApiUrl = 'https://plugin.tebex.io/payments';

        const paymentPayload = {
            ign: username,
            price: price,
            packages: [
                {
                    id: packageId,
                },
            ],
            note: note,
        };

        try {
            const response = await axios.post(tebexApiUrl, paymentPayload, {
                headers: {
                    'X-Tebex-Secret': TEBEX_SECRET_KEY,
                    'Content-Type': 'application/json',
                },
            });

            const paymentData = response.data;

            await interaction.editReply({
                content: `Payment created successfully!\n\n**Details:**\n- Username: ${username}\n- Price: ${price}\n- Package ID: ${packageId}\n- Note: ${note}`,
            });
        } catch (error) {
            console.error('Error creating payment:', error.response?.data || error.message);
            await interaction.editReply({
                content: 'An error occurred while creating the payment. Please try again later.',
            });
        }
    },
};
