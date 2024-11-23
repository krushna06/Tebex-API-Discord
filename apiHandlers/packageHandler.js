const axios = require('axios');

async function addPackageToBasket(basketIdent, packageId, quantity) {
    try {
        const apiKey = process.env.TEBEX_API_KEY;
        const response = await axios.post(
            `${process.env.BASE_URL}/baskets/${basketIdent}/packages`,
            { package_id: packageId, quantity },
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
        console.error('Error adding package to basket:', error.message);
        throw error;
    }
}

async function removePackageFromBasket(basketIdent, packageId) {
    try {
        const apiKey = process.env.TEBEX_API_KEY;
        const response = await axios.post(
            `${process.env.BASE_URL}/baskets/${basketIdent}/packages/remove`,
            { package_id: packageId },
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
        console.error('Error removing package from basket:', error.message);
        throw error;
    }
}

async function getBasketDetails(basketIdent) {
    try {
        const apiKey = process.env.TEBEX_API_KEY;
        const response = await axios.get(
            `${process.env.BASE_URL}/accounts/${apiKey}/baskets/${basketIdent}`,
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
        console.error('Error fetching basket details:', error.message);
        throw error;
    }
}

module.exports = { addPackageToBasket, removePackageFromBasket, getBasketDetails };
