import { verifyRequest, json } from './lib/discord.js';
import { handleInteraction } from './handlers/interactions.js';
import { handleScheduled } from './handlers/scheduled.js';
import { registerAllCommands } from './commands/index.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- Admin endpoints (guarded by REGISTER_KEY query param) ---

    // GET /admin/register?key=... — bulk-register all slash commands with Discord
    if (request.method === 'GET' && url.pathname === '/admin/register') {
      if (!isAuthorized(url, env)) return new Response('Unauthorized', { status: 401 });
      try {
        const result = await registerAllCommands(env);
        return json({ ok: true, result });
      } catch (err) {
        return json({ ok: false, error: String(err) }, { status: 500 });
      }
    }

    // --- Discord interaction endpoint ---

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const bodyText = await request.text();

    if (!signature || !timestamp) {
      return new Response('Missing Discord signature headers', { status: 401 });
    }

    const isValid = await verifyRequest(bodyText, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    if (!isValid) return new Response('Bad request signature', { status: 401 });

    const interaction = JSON.parse(bodyText);
    return handleInteraction(interaction, env);
  },

  async scheduled(controller, env, ctx) {
    return handleScheduled(controller, env, ctx);
  },
};

function isAuthorized(url, env) {
  const key = url.searchParams.get('key');
  return env.REGISTER_KEY && key === env.REGISTER_KEY;
}
