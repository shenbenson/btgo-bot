// Add new commands here — they are automatically registered and routed.
import { btgoCommand } from './btgo.js';
import { leetcodeCommand } from './leetcode.js';

const commands = [btgoCommand, leetcodeCommand];

export const commandMap = Object.fromEntries(commands.map((c) => [c.name, c]));

// Bulk-replaces all global application commands via PUT (idempotent).
export async function registerAllCommands(env) {
  const body = commands.map(({ name, description, type }) => ({ name, description, type }));

  const res = await fetch(
    `https://discord.com/api/v10/applications/${env.DISCORD_APPLICATION_ID}/commands`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw new Error(`Command registration failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
