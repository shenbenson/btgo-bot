import { discordApi } from '../lib/discord.js';

const GRAPHQL_URL = 'https://leetcode.com/graphql';

const DAILY_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
        frontendQuestionId: questionFrontendId
        title
        difficulty
        acRate
      }
    }
  }
`;

export async function getDailyChallenge() {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // LeetCode requires a referer to serve the GraphQL endpoint
      Referer: 'https://leetcode.com',
    },
    body: JSON.stringify({ query: DAILY_QUERY }),
  });

  if (!res.ok) throw new Error(`LeetCode API failed: ${res.status}`);

  const { data } = await res.json();
  const challenge = data?.activeDailyCodingChallengeQuestion;
  if (!challenge) throw new Error('No daily challenge in response');
  return challenge;
}

export function buildThreadName(challenge) {
  const { question, date } = challenge;
  // Discord thread names max out at 100 chars; trim the title if needed
  const base = `📅 ${date} · ${question.frontendQuestionId}. ${question.title}`;
  return base.length > 100 ? base.slice(0, 97) + '…' : base;
}

export function formatChallengePost(challenge) {
  const { question, link, date } = challenge;
  const acRate = Number(question.acRate).toFixed(1);
  const diffEmoji = { Easy: '🟢', Medium: '🟡', Hard: '🔴' }[question.difficulty] ?? '⚪';
  const url = `https://leetcode.com${link}`;

  return [
    `## 📅 LeetCode Daily — ${date}`,
    `**${question.frontendQuestionId}. ${question.title}**`,
    `${diffEmoji} **${question.difficulty}** · Acceptance: **${acRate}%**`,
    '',
    `🔗 <${url}>`,
  ].join('\n');
}

export async function postDailyChallenge(env) {
  const challenge = await getDailyChallenge();
  if (await threadExistsForDate(env, challenge.date)) return;
  const name = buildThreadName(challenge);
  const content = formatChallengePost(challenge);
  await createChallengeThread(env, env.DISCORD_LEETCODE_CHANNEL_ID, name, content);
}

// Checks active threads in the channel for one already named with this date.
export async function threadExistsForDate(env, date) {
  const data = await discordApi(
    `/guilds/${env.DISCORD_LEETCODE_GUILD_ID}/threads/active`,
    {},
    env.DISCORD_BOT_TOKEN,
  );
  return data.threads.some(
    (t) => t.parent_id === env.DISCORD_LEETCODE_CHANNEL_ID && t.name.includes(date),
  );
}

export async function createChallengeThread(env, channelId, name, content) {
  // Creates a standalone public thread in a text channel, then posts into it.
  const thread = await discordApi(
    `/channels/${channelId}/threads`,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        type: 11, // PUBLIC_THREAD
        auto_archive_duration: 1440,
      }),
    },
    env.DISCORD_BOT_TOKEN,
  );

  await discordApi(
    `/channels/${thread.id}/messages`,
    { method: 'POST', body: JSON.stringify({ content }) },
    env.DISCORD_BOT_TOKEN,
  );
}

