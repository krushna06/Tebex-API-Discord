const express = require('express');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
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
            console.log('Payload:', JSON.stringify(payload, null, 2));

            const minecraftUsername = payload.subject.customer.username.username;

            if (minecraftUsername) {
                const basketRemoved = await removeBasketIdent(minecraftUsername);
                if (basketRemoved) {
                    console.log('Basket_ident removed successfully.');
                } else {
                    console.log('No basket_ident to remove for this username.');
                }
            } else {
                console.warn('No Minecraft username found in payload.');
            }
        } else {
            console.warn(`Unhandled webhook type: ${payload.type}`);
            console.log('Payload:', JSON.stringify(payload, null, 2));
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
