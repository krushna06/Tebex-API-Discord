const axios = require('axios');

async function fetchCategoriesWithPackages() {
    try {
        const apiKey = process.env.TEBEX_API_KEY;
        const response = await axios.get(
            `${process.env.BASE_URL}/accounts/${apiKey}/categories?includePackages=1`,
            {
                headers: {
                    'X-Authorization': apiKey,
                },
                timeout: 5000,
            }
        );

        if (response.data && response.data.data) {
            return response.data.data;
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error fetching categories with packages:', error.message);
        throw error;
    }
}

module.exports = { fetchCategoriesWithPackages };
