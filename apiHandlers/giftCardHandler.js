const axios = require('axios');

module.exports = {
    async applyGiftCard({ discordUserId, giftCardNumber, db, token }) {
        const { getBasketIdent } = require('../utility/databaseHandler');

        const basketIdent = await getBasketIdent(db, discordUserId);
        if (!basketIdent) {
            throw new Error('No basket found for your account. Please log in first using the `/login` command.');
        }

        const apiUrl = `https://headless.tebex.io/api/accounts/${token}/baskets/${basketIdent}/giftcards`;

        try {
            const response = await axios.post(apiUrl, { card_number: giftCardNumber }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tebex-Secret': token,
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
    }
};
