const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;

const TEBEX_SECRET_KEY = '00f634e947c88c4090291a75cf203ca6';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/877447472086134814/ECUlwGULSydZwEph0ogtNPTylYMeZOB-VyWRmL1eJbfWFJo89gYYKzgMsDL6noJJiOaB';

const ALLOWED_IPS = ['18.209.80.3', '54.87.231.232'];

app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

function verifyTebexIP(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!ALLOWED_IPS.includes(ip)) {
        console.error('Unauthorized IP:', ip);
        return res.status(404).send('Not Found');
    }
    next();
}

function verifyTebexSignature(req, res, next) {
    const signature = req.headers['x-signature'];
    if (!signature) {
        console.error('Signature missing');
        return res.status(401).send('Signature missing');
    }

    const bodyHash = crypto.createHash('sha256').update(req.rawBody).digest('hex');
    const hmac = crypto.createHmac('sha256', TEBEX_SECRET_KEY).update(bodyHash).digest('hex');

    if (signature !== hmac) {
        console.error('Invalid signature');
        return res.status(403).send('Invalid signature');
    }

    next();
}

async function sendDiscordNotification(email, paymentMethod, pricePaid) {
    try {
        const embed = {
            title: 'Payment Completed',
            color: 3066993,
            fields: [
                { name: 'Email', value: email, inline: true },
                { name: 'Payment Method', value: paymentMethod, inline: true },
                { name: 'Price Paid', value: `$${pricePaid}`, inline: true }
            ],
            timestamp: new Date().toISOString()
        };

        await axios.post(DISCORD_WEBHOOK_URL, { embeds: [embed] });
        console.log('Notification sent to Discord');
    } catch (error) {
        console.error('Failed to send Discord notification:', error.message);
    }
}

app.post('/payment_completed', verifyTebexIP, verifyTebexSignature, async (req, res) => {
    const webhook = req.body;

    if (webhook.type === 'validation.webhook') {
        console.log('Validation Webhook Received:', webhook);

        return res.status(200).json({ id: webhook.id });
    }

    if (webhook.type === 'payment.completed') {
        console.log('Webhook Received:', webhook);

        const email = webhook.subject.customer.email || 'Unknown';
        const paymentMethod = webhook.subject.payment_method.name || 'Unknown';
        const pricePaid = webhook.subject.price_paid.amount || 0;

        await sendDiscordNotification(email, paymentMethod, pricePaid);

        return res.status(200).send('Webhook received and processed');
    }

    res.status(200).send('Webhook received');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
