const axios = require('axios');

async function createBasket(username) {
    try {
        const apiKey = process.env.TEBEX_API_KEY;
        const response = await axios.post(`${process.env.BASE_URL}/accounts/${apiKey}/baskets`, { username });

        if (response.data && response.data.data) {
            return response.data.data.ident;
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error creating basket:', error.message);
        throw error;
    }
}

module.exports = { createBasket };
