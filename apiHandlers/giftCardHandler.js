const axios = require('axios');

module.exports = {
    /**
     * Apply a gift card to the user's basket.
     */
    async applyGiftCard({ discordUserId, giftCardNumber, db }) {
        const { getBasketIdent } = require('../utility/databaseHandler');
        const apiKey = process.env.TEBEX_API_KEY;
        const baseUrl = process.env.BASE_URL;

        const basketIdent = await getBasketIdent(db, discordUserId);
        if (!basketIdent) {
            throw new Error('No basket found for your account. Please log in first using the `/login` command.');
        }

        const apiUrl = `${baseUrl}/accounts/${apiKey}/baskets/${basketIdent}/giftcards`;

        try {
            const response = await axios.post(apiUrl, { card_number: giftCardNumber }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tebex-Secret': apiKey,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error applying gift card:', error);

            if (error.response) {
                const statusCode = error.response.status;
                const errorDetail = error.response.data?.detail;

                if (statusCode === 400 && errorDetail?.includes('no funds available')) {
                    throw new Error('The gift card has no funds available. Please check the card balance.');
                }

                if (statusCode === 404) {
                    throw new Error('Gift card not found. Please ensure you entered the correct card number.');
                }
            }

            throw new Error('An error occurred while applying the gift card. Please try again later.');
        }
    },

    /**
     * Remove a gift card from the user's basket.
     */
    async removeGiftCard({ discordUserId, giftCardNumber, db }) {
        const { getBasketIdent } = require('../utility/databaseHandler');
        const apiKey = process.env.TEBEX_API_KEY;
        const baseUrl = process.env.BASE_URL;

        const basketIdent = await getBasketIdent(db, discordUserId);
        if (!basketIdent) {
            throw new Error('No basket found for your account. Please log in first using the `/login` command.');
        }

        const apiUrl = `${baseUrl}/accounts/${apiKey}/baskets/${basketIdent}/giftcards/remove`;

        try {
            const response = await axios.post(apiUrl, { card_number: giftCardNumber }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tebex-Secret': apiKey,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error removing gift card:', error);

            if (error.response) {
                const statusCode = error.response.status;
                const errorDetail = error.response.data?.detail;

                if (statusCode === 404) {
                    throw new Error('Gift card not found in your basket. Please check the card number and try again.');
                }

                if (statusCode === 400) {
                    throw new Error('The specified gift card cannot be removed. Please ensure it is valid.');
                }
            }

            throw new Error('An error occurred while removing the gift card. Please try again later.');
        }
    },
};
