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
        console.log('Connected to SQLite database.');
    }
});

app.use(express.raw({ type: 'application/json' }));

function validateSignature(req, secret) {
    const receivedSignature = req.headers['x-signature'];
    const rawBody = req.body.toString();
    const bodyHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyHash)
        .digest('hex');

    return receivedSignature === expectedSignature;
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

app.post('/payment_completed', async (req, res) => {
    try {
        const secret = process.env.WEBHOOK_SECRET;

        if (!validateSignature(req, secret)) {
            console.error('Invalid signature');
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
            console.warn(`Unhandled webhook type: ${payload.type}`);
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Error handling webhook:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Webhook server running on port ${port}`);
});
