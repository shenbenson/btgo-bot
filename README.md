# btgo-bot

A Discord bot running on Cloudflare Workers with two features:

- **BTGO price** — `/btgo` slash command shows the latest price and daily change. A daily close report is also posted automatically at 4:05 PM ET on weekdays.
- **LeetCode daily** — creates a thread with the daily challenge at 00:05 UTC. `/leetcode` triggers it manually and skips if the thread already exists.

## Project structure

```
src/
  index.js                 # Worker entry point (fetch + scheduled)
  lib/discord.js           # Request verification, Discord API client, response helpers
  commands/
    index.js               # Command registry — add new commands here
    btgo.js                # /btgo command
    leetcode.js            # /leetcode command
  features/
    btgo.js                # Price fetch (Twelve Data), formatters, EOD logic
    leetcode.js            # LeetCode GraphQL fetch, thread creation, dedup check
  handlers/
    interactions.js        # Discord interaction router
    scheduled.js           # Cron router
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure `wrangler.toml`

The file is already set up. No changes needed unless you rename the worker.

### 3. Set secrets

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

Copy `.dev.vars.example` to `.dev.vars` and fill in values for local development.

### 4. Deploy

```bash
npx wrangler deploy
```

### 5. Register slash commands

```bash
curl "https://<your-worker>.workers.dev/admin/register?key=<REGISTER_KEY>"
```

### 6. Set the interactions endpoint

In the [Discord Developer Portal](https://discord.com/developers/applications), set the **Interactions Endpoint URL** to your worker URL.

## Adding a new command

1. Create `src/commands/yourcommand.js` exporting an object with `name`, `description`, `type: 1`, and `handle(interaction, env)`.
2. Import and add it to the `commands` array in `src/commands/index.js`.
3. Re-deploy and re-run `/admin/register`.

## Environment variables

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
