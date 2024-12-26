const axios = require('axios');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, TEBEX_API_KEY, RAZORPAY_CALLBACK_URL } = process.env;

async function fetchBasketDetails(basketIdent) {
    if (!basketIdent || !TEBEX_API_KEY) {
        throw new Error('Basket identifier and Tebex API key are required.');
    }

    const tebexApiUrl = `https://headless.tebex.io/api/accounts/${TEBEX_API_KEY}/baskets/${basketIdent}`;

    try {
        const response = await axios.get(tebexApiUrl, {
            headers: {
                Accept: 'application/json',
            },
        });

        return response.data.data;
    } catch (error) {
        console.error('Error fetching basket details from Tebex:', error.response?.data || error.message);
        throw new Error('Failed to fetch basket details from Tebex.');
    }
}

async function generateRazorpayLink(basketIdent) {
    const basketDetails = await fetchBasketDetails(basketIdent);

    let totalPrice = basketDetails.total_price;
    const baseCurrency = basketDetails.currency || 'USD';
    const username = basketDetails.username || 'Unknown User';

    const conversionRate = 85;

    if (baseCurrency === 'USD') {
        totalPrice = totalPrice * conversionRate;
    }

    if (!totalPrice || totalPrice <= 0) {
        throw new Error('Invalid total price. Cannot proceed with Razorpay payment link creation.');
    }

    let packageDescription = `Payment for items in basket (${username})\n`;
    const packageIds = [];

    basketDetails.packages.forEach(pkg => {
        const packagePriceInINR = pkg.in_basket.price * conversionRate;
        packageDescription += `- ${pkg.name}: ₹ ${Math.round(packagePriceInINR)}\n`;
        packageIds.push(pkg.id);
    });

    packageDescription += `\nPackages: ${packageIds.join(', ')}`;

    const razorpayApiUrl = 'https://api.razorpay.com/v1/payment_links';

    const razorpayPayload = {
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        description: packageDescription.trim(),
        customer: {
            name: username,
            email: `${username}@discord.com`,
        },
        notify: {
            email: true,
            sms: false,
        },
        callback_url: RAZORPAY_CALLBACK_URL || 'https://yourdomain.com/callback',
        callback_method: 'get',
    };

    try {
        const response = await axios.post(razorpayApiUrl, razorpayPayload, {
            auth: {
                username: RAZORPAY_KEY_ID,
                password: RAZORPAY_KEY_SECRET,
            },
        });

        return response.data.short_url;
    } catch (error) {
        console.error('Error creating Razorpay payment link:', error.response?.data || error.message);
        throw new Error('Failed to create Razorpay payment link.');
    }
}


module.exports = {
    generateRazorpayLink,
};