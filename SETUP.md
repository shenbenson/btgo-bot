# Setup

## Prerequisites

- [Cloudflare](https://cloudflare.com) account
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install`)
- Discord application with a bot user ([Developer Portal](https://discord.com/developers/applications))
- [Twelve Data](https://twelvedata.com) API key

## 1. Set secrets

```bash
npx wrangler secret put DISCORD_PUBLIC_KEY
npx wrangler secret put DISCORD_APPLICATION_ID
npx wrangler secret put DISCORD_BOT_TOKEN
npx wrangler secret put DISCORD_BTGO_CHANNEL_ID        # channel for EOD price posts
npx wrangler secret put DISCORD_LEETCODE_CHANNEL_ID    # channel for LeetCode threads
npx wrangler secret put DISCORD_LEETCODE_GUILD_ID      # server that owns the above channel
npx wrangler secret put TWELVE_DATA_API_KEY
npx wrangler secret put REGISTER_KEY                   # password for /admin/register
```

For local development, copy these into a `.dev.vars` file (never commit it).

## 2. Deploy

```bash
npx wrangler deploy
```

## 3. Register slash commands

```bash
curl "https://<your-worker>.workers.dev/admin/register?key=<REGISTER_KEY>"
```

## 4. Set the interactions endpoint

In the Discord Developer Portal → your app → **General Information**, set **Interactions Endpoint URL** to your worker URL.

## Environment variables reference

| Variable | Description |
|---|---|
| `DISCORD_PUBLIC_KEY` | From the Discord Developer Portal |
| `DISCORD_APPLICATION_ID` | From the Discord Developer Portal |
| `DISCORD_BOT_TOKEN` | Bot token from the Discord Developer Portal |
| `DISCORD_BTGO_CHANNEL_ID` | Channel ID for daily BTGO price posts |
| `DISCORD_LEETCODE_CHANNEL_ID` | Channel ID for LeetCode daily threads |
| `DISCORD_LEETCODE_GUILD_ID` | Server ID that owns the LeetCode channel |
| `TWELVE_DATA_API_KEY` | [Twelve Data](https://twelvedata.com) API key |
| `REGISTER_KEY` | Secret key to protect the `/admin/register` endpoint |
