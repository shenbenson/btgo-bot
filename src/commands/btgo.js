import { getQuote, formatSlashReply } from '../features/btgo.js';

export const btgoCommand = {
  // Discord API fields
  name: 'btgo',
  description: 'Show the latest BTGO price and daily change',
  type: 1,

  async handle(_interaction, env) {
    try {
      const quote = await getQuote(env);
      return { type: 4, data: { content: formatSlashReply(quote) } };
    } catch (err) {
      console.error('btgo command error:', err);
      return { type: 4, data: { content: 'Sorry — could not fetch BTGO right now.' } };
    }
  },
};
