const express = require('express');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database('./database/users.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        // console.log('Connected to SQLite database.');
    }
});

app.use(express.raw({ type: 'application/json' }));

function validateTebexSignature(req, secret) {
    const receivedSignature = req.headers['x-signature'];
    const rawBody = req.body.toString();
    const bodyHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyHash)
        .digest('hex');

    return receivedSignature === expectedSignature;
}

function validateRazorpaySignature(req, secret) {
    const receivedSignature = req.headers['x-razorpay-signature'];
    const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(req.body)
        .digest('hex');

    return receivedSignature === generatedSignature;
}

function removeBasketIdent(minecraftUsername) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET basket_ident = '' WHERE minecraft_username = ?`;

        db.run(query, [minecraftUsername], function (err) {
            if (err) {
                console.error('Error removing basket_ident:', err.message);
                return reject(err);
            }
            if (this.changes > 0) {
                console.log(`Basket_ident removed (set to empty string) for user: ${minecraftUsername}`);
                resolve(true);
            } else {
                console.warn(`No matching user found for username: ${minecraftUsername}`);
                resolve(false);
            }
        });
    });
}

async function sendToDiscord(username, total, paymentMethod, transactionId) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const embed = {
        embeds: [
            {
                title: 'Payment Completed',
                color: 5814783,
                fields: [
                    {
                        name: 'Username',
                        value: username,
                        inline: true,
                    },
                    {
                        name: 'Total',
                        value: `$${total}`,
                        inline: true,
                    },
                    {
                        name: 'Payment Method',
                        value: paymentMethod,
                        inline: true,
                    },
                    {
                        name: 'View Transaction',
                        value: `[Click Here](https://creator.tebex.io/payments?attribute%5B0%5D=txn_id&query%5B0%5D=${transactionId}&search_mode=and)`,
                    },
                ],
                footer: {
                    text: 'Tebex Payment Notification',
                },
                timestamp: new Date(),
            },
        ],
    };

    try {
        await axios.post(webhookUrl, embed);
        console.log('Embed message sent to Discord successfully.');
    } catch (error) {
        console.error('Error sending message to Discord:', error.message);
    }
}

async function sendToDiscordRazorpay(username, total, paymentMethod, transactionId) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const embed = {
        embeds: [
            {
                title: 'Razorpay Payment Completed',
                color: 5814783,
                fields: [
                    {
                        name: 'Username',
                        value: username,
                        inline: true,
                    },
                    {
                        name: 'Total',
                        value: `₹${total}`,
                        inline: true,
                    },
                    {
                        name: 'Payment Method',
                        value: paymentMethod,
                        inline: true,
                    },
                    {
                        name: 'View Transaction',
                        value: `[Click Here](https://dashboard.razorpay.com/app/payments/${transactionId})`,
                    },
                ],
                footer: {
                    text: 'Razorpay Payment Notification',
                },
                timestamp: new Date(),
            },
        ],
    };

    try {
        await axios.post(webhookUrl, embed);
        console.log('Razorpay embed message sent to Discord successfully.');
    } catch (error) {
        console.error('Error sending Razorpay message to Discord:', error.message);
    }
}

app.post('/payment_completed_tebex', async (req, res) => {
    try {
        const secret = process.env.WEBHOOK_SECRET;

        if (!validateTebexSignature(req, secret)) {
            console.error('Invalid Tebex signature');
            return res.status(403).send('Forbidden');
        }

        const payload = JSON.parse(req.body.toString());

        if (payload.type === 'validation.webhook') {
            console.log('Validation webhook received.');
            return res.status(200).json({ id: payload.id });
        }

        if (payload.type === 'payment.completed') {
            console.log('Payment completed webhook received.');

            const minecraftUsername = payload.subject.customer.username.username;
            const totalAmount = payload.subject.price_paid.amount;
            const paymentMethod = payload.subject.payment_method.name;
            const transactionId = payload.subject.transaction_id;

            if (minecraftUsername) {
                const basketRemoved = await removeBasketIdent(minecraftUsername);
                if (basketRemoved) {
                    console.log('Basket_ident removed successfully.');
                } else {
                    console.log('No basket_ident to remove for this username.');
                }
                await sendToDiscord(minecraftUsername, totalAmount, paymentMethod, transactionId);
            } else {
                console.warn('No Minecraft username found in payload.');
            }
        } else {
            console.warn(`Unhandled Tebex webhook type: ${payload.type}`);
        }

        res.status(200).send('Tebex webhook received');
    } catch (error) {
        console.error('Error handling Tebex webhook:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/payment_completed_razorpay', async (req, res) => {
    try {
        const secret = 'GmKHiA.Wptm3iaU';

        if (!validateRazorpaySignature(req, secret)) {
            console.error('Invalid Razorpay signature');
            return res.status(403).send('Forbidden');
        }

        const payload = JSON.parse(req.body.toString());
        console.log('Razorpay payment_link.paid event received:');
        console.log(JSON.stringify(payload, null, 2));

        const paymentDetails = payload.payload.payment.entity;
        const paymentLinkDetails = payload.payload.payment_link.entity;

        const username = paymentLinkDetails.customer.name || 'Unknown User';
        const totalAmountInRupees = paymentDetails.amount / 100; 
        const totalAmountInDollars = (totalAmountInRupees / 85).toFixed(2);
        const description = paymentLinkDetails.description;

        const packageIdsMatch = description.match(/Packages: ([\d, ]+)/);
        const packageIds = packageIdsMatch ? packageIdsMatch[1].split(',').map(id => id.trim()) : [];

        if (username && packageIds.length > 0) {
            const basketRemoved = await removeBasketIdent(username);
            if (basketRemoved) {
                console.log('Basket_ident removed successfully.');
            } else {
                console.log('No basket_ident to remove for this username.');
            }

            await createPaymentOnTebex(username, totalAmountInDollars, packageIds, 'Razorpay automated payment');
        } else {
            console.warn('Insufficient data to create payment: Missing username or package IDs.');
        }

        res.status(200).send('Razorpay webhook received');
    } catch (error) {
        console.error('Error handling Razorpay webhook:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

async function createPaymentOnTebex(username, price, packageIds, note) {
    const tebexApiUrl = 'https://plugin.tebex.io/payments';
    const paymentPayload = {
        ign: username,
        price: price,
        packages: packageIds.map(id => ({ id: parseInt(id, 10) })),
        note: note,
    };

    try {
        const response = await axios.post(tebexApiUrl, paymentPayload, {
            headers: {
                'X-Tebex-Secret': process.env.TEBEX_SECRET_KEY,
                'Content-Type': 'application/json',
            },
        });

        console.log(`Payment created successfully for username: ${username}, price: ${price}, packages: ${packageIds}`);
        console.log('Response from Tebex:', response.data);
    } catch (error) {
        console.error('Error creating payment on Tebex:', error.response?.data || error.message);
    }
}

app.listen(port, () => {
    console.log(`Webhook server running on port ${port}`);
});
