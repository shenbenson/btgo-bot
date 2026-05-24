export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
}

export async function verifyRequest(bodyText, signature, timestamp, publicKeyHex) {
  const publicKey = hexToBytes(publicKeyHex);
  const sig = hexToBytes(signature);
  const message = new TextEncoder().encode(timestamp + bodyText);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    publicKey,
    { name: 'Ed25519', namedCurve: 'Ed25519' },
    false,
    ['verify'],
  );

  return crypto.subtle.verify('Ed25519', cryptoKey, sig, message);
}

// Thin wrapper around the Discord REST API.
export async function discordApi(path, options = {}, botToken) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    ...options,
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord API ${path} → ${res.status}: ${body}`);
  }

  // 204 No Content has no body
  if (res.status === 204) return null;
  return res.json();
}

function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
