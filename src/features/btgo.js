import { discordApi } from '../lib/discord.js';

const SYMBOL = 'BTGO';

export async function getQuote(env) {
  const cache = caches.default;
  const cacheKey = new Request(`https://cache.internal/quote/${SYMBOL}`);

  const cached = await cache.match(cacheKey);
  if (cached) return cached.json();

  const res = await fetch(
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(SYMBOL)}&apikey=${encodeURIComponent(env.TWELVE_DATA_API_KEY)}`,
    { headers: { Accept: 'application/json' } },
  );

  if (!res.ok) throw new Error(`Twelve Data request failed: ${res.status}`);

  const data = await res.json();
  if (data.code || !data.close || !data.previous_close) {
    throw new Error(data.message || 'Malformed quote response');
  }

  const cacheable = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30',
    },
  });
  cache.put(cacheKey, cacheable.clone()).catch(() => {});

  return data;
}

export function formatSlashReply(quote) {
  const price = Number(quote.close);
  const prev = Number(quote.previous_close);
  const delta = price - prev;
  const pct = prev === 0 ? 0 : (delta / prev) * 100;
  const arrow = delta > 0 ? '🟢' : delta < 0 ? '🔴' : '⚪';
  const market = quote.is_market_open ? 'Market open' : 'Market closed';
  const asOf = quote.datetime
    ? `\nAs of: ${quote.datetime}${quote.exchange ? ` (${quote.exchange})` : ''}`
    : '';

  return [
    `**BTGO** ${arrow}`,
    `Price: **$${price.toFixed(2)}**`,
    `Day change: **${signed(delta)}** (**${signed(pct)}%**)`,
    `${market}${asOf}`,
  ].join('\n');
}

export function formatDailyPost(quote) {
  const close = Number(quote.close);
  const prev = Number(quote.previous_close);
  const delta = close - prev;
  const pct = prev === 0 ? 0 : (delta / prev) * 100;
  const arrow = delta > 0 ? '🟢' : delta < 0 ? '🔴' : '⚪';

  const today = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return [
    `📈 **BTGO Daily Close Report — ${today}**`,
    `${arrow} Close: **$${close.toFixed(2)}**`,
    `Change vs prior close: **${signed(delta)}** (**${signed(pct)}%**)`,
    `Previous close: **$${prev.toFixed(2)}**`,
  ].join('\n');
}

export async function postDailyUpdate(env) {
  const quote = await getQuote(env);
  const content = formatDailyPost(quote);
  await discordApi(
    `/channels/${env.DISCORD_BTGO_CHANNEL_ID}/messages`,
    { method: 'POST', body: JSON.stringify({ content }) },
    env.DISCORD_BOT_TOKEN,
  );
}

// Returns true only at 4:00 PM New York time on weekdays.
export function shouldRunEod(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  return (
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(get('weekday')) &&
    get('hour') === '16' &&
    get('minute') === '05'
  );
}

function signed(n) {
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}`;
}
