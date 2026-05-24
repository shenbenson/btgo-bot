# btgo-bot

A Discord bot running on Cloudflare Workers.

- **`/btgo`** — latest BTGO price and daily change. Auto-posts a close report at 4:05 PM ET on weekdays.
- **`/leetcode`** — posts today's LeetCode daily challenge as a thread. Also runs automatically at 00:05 UTC.

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

## Adding a new command

1. Create `src/commands/yourcommand.js` exporting an object with `name`, `description`, `type: 1`, and `handle(interaction, env)`.
2. Import and add it to the `commands` array in `src/commands/index.js`.
3. Re-deploy and re-run `/admin/register`.
