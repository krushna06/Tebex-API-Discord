const axios = require('axios');

module.exports = {
    async applyCreatorCode({ discordUserId, creatorCode, db, interaction }) {
        const apiKey = process.env.TEBEX_API_KEY;
        const baseUrl = process.env.BASE_URL;

        if (!apiKey) {
            throw new Error('Tebex API key is missing.');
        }

        const { getBasketIdent } = require('../utility/databaseHandler');
        const basketIdent = await getBasketIdent(db, discordUserId);

        if (!basketIdent) {
            interaction.reply({ content: 'No basket found for your account. Please log in first using the `/login` command.', ephemeral: true });
            return;
        }

        const apiUrl = `${baseUrl}/accounts/${apiKey}/baskets/${basketIdent}/creator-codes`;

        try {
            const response = await axios.post(apiUrl, { creator_code: creatorCode }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tebex-Secret': apiKey,
                },
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while applying the creator code.';
            console.error('Error applying creator code:', error);
            throw new Error(errorMessage);
        }
    },

    async removeCreatorCode({ discordUserId, db }) {
        const apiKey = process.env.TEBEX_API_KEY;
        const baseUrl = process.env.BASE_URL;

        if (!apiKey) {
            throw new Error('Tebex API key is missing.');
        }

        const { getBasketIdent } = require('../utility/databaseHandler');
        const basketIdent = await getBasketIdent(db, discordUserId);

        if (!basketIdent) {
            throw new Error('No basket found for your account. Please link your account first.');
        }

        const apiUrl = `${baseUrl}/accounts/${apiKey}/baskets/${basketIdent}/creator-codes/remove`;

        try {
            const response = await axios.post(apiUrl, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tebex-Secret': apiKey,
                },
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while removing the creator code.';
            console.error('Error removing creator code:', error);
            throw new Error(errorMessage);
        }
    },
};
