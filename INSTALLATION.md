## Tebex-Cord Setup Guide

### Setting Up the Discord Bot

1. **Create a Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.

2. **Enable Privileged Gateway Intents**
   - In the "Bot" tab, enable all **3 Privileged Gateway Intents**.

3. **Reset the Bot Token**
   - Reset the bot token, then copy and paste it into your `.env` file.

4. **Copy the Client ID**
   - Go to the **OAuth2** tab, copy your **Client ID**, and add it to your `.env` file.

5. **Invite the Bot to Your Server**
   - Don't forget to invite the bot to your Discord server using the generated OAuth2 URL.

---

### Setting Up the `.env` File

Make sure to properly configure the following fields in your `.env` file:

- **DISCORD_TOKEN**: Your bot token.
- **CLIENT_ID**: Your bot's client ID.
- **TEBEX_API_KEY**: Get the "Public Token" from [Tebex API Keys](https://creator.tebex.io/developers/api-keys).
- **BASE_URL**: Leave this as `https://headless.tebex.io/api` (do not change).
- **GUILD_ID**: Your Discord server ID.
- **WEBHOOK_SECRET**: Get the "Secret Key" from [Tebex Webhooks](https://creator.tebex.io/webhooks/endpoints).
- **PORT**: Set to `3000` or any available port.
- **DISCORD_WEBHOOK_URL**: Your Discord webhook URL for receiving payment notifications.

---

### Setting Up a Webhook for Tebex

1. **Create a Webhook in Your Tebex Store**
   - Log in to your Tebex store dashboard.

2. **Navigate to Webhook Settings**
   - Go to [Tebex Webhook Endpoints](https://creator.tebex.io/webhooks/endpoints).

3. **Add a New Webhook Endpoint**
   - Click the **"Add Endpoint"** button.

4. **Enter the Endpoint URL**
   - In the URL field, input your endpoint URL and append `/payment_completed` at the end.  
   - **Example:** `https://yourdomain.com/payment_completed`

5. **Select Webhook Type**
   - From the **Webhook Types** dropdown, choose **"Payment Completed"**.
   - Click **"Add"** to save the webhook.
