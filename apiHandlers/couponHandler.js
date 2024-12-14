const axios = require('axios');

module.exports = {
    /**
     * Apply a coupon to the user's basket.
     */
    async applyCoupon({ discordUserId, couponCode, db }) {
        const { getBasketIdent } = require('../utility/databaseHandler');
        const apiKey = process.env.TEBEX_API_KEY;
        const baseUrl = process.env.BASE_URL;

        const basketIdent = await getBasketIdent(db, discordUserId);
        if (!basketIdent) {
            throw new Error('No basket found for your account. Please log in first using the `/login` command.');
        }

        const apiUrl = `${baseUrl}/accounts/${apiKey}/baskets/${basketIdent}/coupons`;

        try {
            const response = await axios.post(apiUrl, { coupon_code: couponCode }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tebex-Secret': apiKey,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error applying coupon:', error);

            if (error.response) {
                const statusCode = error.response.status;
                const errorDetail = error.response.data?.detail;

                if (statusCode === 404) {
                    throw new Error('Coupon not found. Please ensure you entered the correct coupon code.');
                }

                if (statusCode === 400) {
                    throw new Error('The coupon code is invalid or cannot be applied to this basket.');
                }
            }
            throw new Error('An error occurred while applying the coupon. Please try again later.');
        }
    },

    /**
     * Remove a coupon from the user's basket.
     */
    async removeCoupon({ discordUserId, couponCode, db }) {
        const { getBasketIdent } = require('../utility/databaseHandler');
        const apiKey = process.env.TEBEX_API_KEY;
        const baseUrl = process.env.BASE_URL;

        const basketIdent = await getBasketIdent(db, discordUserId);
        if (!basketIdent) {
            throw new Error('No basket found for your account. Please log in first using the `/login` command.');
        }

        const apiUrl = `${baseUrl}/accounts/${apiKey}/baskets/${basketIdent}/coupons/remove`;

        try {
            await axios.post(apiUrl, { coupon_code: couponCode }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tebex-Secret': apiKey,
                },
            });

            return `Successfully removed the coupon code: ${couponCode} from your basket.`;
        } catch (error) {
            console.error('Error removing coupon:', error);

            if (error.response) {
                const statusCode = error.response.status;

                if (statusCode === 404) {
                    throw new Error('Coupon not found in the basket to remove.');
                }
            }
            throw new Error('An error occurred while removing the coupon. Please try again later.');
        }
    },
};
