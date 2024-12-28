# Tebex-Cord Setup Guide

### 1. Setting Up the Discord Bot

#### Step 1: Create a Discord Application
- Visit the [Discord Developer Portal](https://discord.com/developers/applications).
- Click **"New Application"** and give it a name.

#### Step 2: Enable Privileged Gateway Intents
- In the "Bot" tab, enable the following **3 Privileged Gateway Intents**:
  - **Presence Intent**
  - **Server Members Intent**
  - **Message Content Intent**

#### Step 3: Reset the Bot Token
- Under the "Bot" tab, reset the bot token.
- Copy the token and paste it into your `.env` file under `DISCORD_TOKEN`.

#### Step 4: Copy the Client ID
- Go to the **OAuth2** tab.
- Copy your **Client ID** and add it to your `.env` file under `CLIENT_ID`.

#### Step 5: Invite the Bot to Your Server
- Use the generated OAuth2 URL to invite the bot to your Discord server.

---

### 2. Setting Up the `.env` File

Make sure your `.env` file contains the following fields with the correct values:

```ini
# Discord
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_discord_server_id_here
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here

# Tebex
BASE_URL=https://headless.tebex.io/api
TEBEX_API_KEY=your_tebex_api_key_here
TEBEX_SECRET_KEY=your_tebex_secret_key_here

# Webserver
PORT=3000
WEBHOOK_SECRET=your_webhook_secret_here

# Razorpay
RAZORPAY=false
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_CALLBACK_URL=your_razorpay_callback_url_here

# Discord Admin Role
ADMIN_ROLE_ID=your_admin_role_id_here
```

Make sure to replace the placeholder values with your actual data.

---

### 3. Setting Up a Webhook for Tebex

#### Step 1: Create a Webhook in Your Tebex Store
- Log in to your [Tebex Store Dashboard](https://creator.tebex.io/dashboard).

#### Step 2: Navigate to Webhook Settings
- Go to [Tebex Webhook Endpoints](https://creator.tebex.io/webhooks/endpoints).

#### Step 3: Add a New Webhook Endpoint
- Click the **"Add Endpoint"** button.

#### Step 4: Enter the Endpoint URL
- In the URL field, enter your endpoint URL followed by `/payment_completed`.  
  **Example**: `https://yourdomain.com/payment_completed_tebex`

#### Step 5: Select Webhook Type
- From the **Webhook Types** dropdown, select **"Payment Completed"**.
- Click **"Add"** to save the webhook.

---

### 4. Setting Up a Webhook for Razorpay

#### Step 1: Access Razorpay Webhook Settings
- Go to [Razorpay Webhooks Settings](https://dashboard.razorpay.com/app/developers/webhooks?action=add-new-webhook).

#### Step 2: Configure Webhook URL
- Set the webhook URL to `https://yourdomain.com/payment_completed_razorpay`.

#### Step 3: Configure Optional Settings
- **Alert Email**: Optional.
- **Secret**: Can be any random string.

#### Step 4: Select Active Events
- From the "Active Events" list, select **"payment.authorized"**.

#### Step 5: Save the Webhook
- Click **"Create Webhook"** to save your Razorpay webhook configuration.

---

- If you need help, feel free to join my discord support server: https://discord.gg/gWRhsZHHeb
