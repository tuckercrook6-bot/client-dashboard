# Telegram bot: talk to an AI assistant from your phone

Do these in order.

---

## Step 1: Create the bot (1 min)

1. Open the **Telegram** app on your phone (or desktop).
2. Search for **@BotFather**.
3. Send: **`/newbot`**
4. When it asks for a name, type anything (e.g. **Lowcore Assistant**).
5. When it asks for a username, type something that ends in **bot** (e.g. **lowcore_dashboard_bot**).
6. BotFather will reply with a **token** that looks like `123456789:ABCdefGHI...`
7. **Copy that token** and keep it for Step 3.

---

## Step 2: Add two env vars (1 min)

In **Vercel** → your project → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|--------|
| `TELEGRAM_BOT_TOKEN` | The token from Step 1 |
| `OPENAI_API_KEY` | Your OpenAI API key (from platform.openai.com) |

Save. Then **redeploy** (Deployments → ⋮ → Redeploy) so the new vars are used.

Optional: in **Cursor**, add the same two lines to your **`.env.local`** so the bot works when you run the app locally.

---

## Step 3: Tell Telegram where to send messages (30 sec)

Open this URL in your browser (replace `YOUR_BOT_TOKEN` with the token from Step 1):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://app.lowcoresystems.com/api/telegram
```

Example: if your token is `123:abc`, the URL is:

```
https://api.telegram.org/bot123:abc/setWebhook?url=https://app.lowcoresystems.com/api/telegram
```

You should see a reply like: `{"ok":true,"result":true,...}`

---

## Step 4: Use it

1. In Telegram, search for your bot by its **username** (e.g. **@lowcore_dashboard_bot**).
2. Tap **Start** or send any message.
3. The bot will reply using the AI with context about your dashboard project.

---

## Optional: Restrict who can use the bot

To allow only your Telegram account:

1. Send a message to your bot.
2. Open: `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`
3. Find `"from":{"id":123456789,...}` and copy the **id**.
4. In Vercel, add an env var: **`TELEGRAM_ALLOWED_USER_IDS`** = that id (e.g. `123456789`).
5. Redeploy. Only that user will get replies; others will see “You're not authorized.”

---

## Troubleshooting

- **Bot doesn’t reply:** Check Vercel logs (Deployments → latest → Logs). Ensure the webhook URL is exactly `https://app.lowcoresystems.com/api/telegram` and that you redeployed after adding env vars.
- **“OpenAI API key is not set”:** Add `OPENAI_API_KEY` in Vercel and redeploy.
