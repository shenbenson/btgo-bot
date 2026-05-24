import { json } from '../lib/discord.js';
import { commandMap } from '../commands/index.js';

export async function handleInteraction(interaction, env) {
  // Discord PING handshake
  if (interaction.type === 1) {
    return json({ type: 1 });
  }

  // Slash commands (APPLICATION_COMMAND)
  if (interaction.type === 2) {
    const command = commandMap[interaction.data?.name];
    if (!command) {
      return json({ type: 4, data: { content: 'Unknown command.' } });
    }
    const response = await command.handle(interaction, env);
    return json(response);
  }

  return json({ type: 4, data: { content: 'Unsupported interaction type.' } });
}
