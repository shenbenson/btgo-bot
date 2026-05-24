import {
  getDailyChallenge,
  buildThreadName,
  formatChallengePost,
  createChallengeThread,
  threadExistsForDate,
} from '../features/leetcode.js';

export const leetcodeCommand = {
  name: 'leetcode',
  description: "Post today's LeetCode daily challenge thread",
  type: 1,

  async handle(_interaction, env) {
    try {
      const challenge = await getDailyChallenge();

      if (await threadExistsForDate(env, challenge.date)) {
        return {
          type: 4,
          data: { content: "Today's LeetCode thread already exists.", flags: 64 },
        };
      }

      await createChallengeThread(
        env,
        env.DISCORD_LEETCODE_CHANNEL_ID,
        buildThreadName(challenge),
        formatChallengePost(challenge),
      );

      return {
        type: 4,
        data: { content: "Posted today's LeetCode challenge thread.", flags: 64 },
      };
    } catch (err) {
      console.error('leetcode command error:', err);
      return {
        type: 4,
        data: { content: 'Failed to post LeetCode thread.', flags: 64 },
      };
    }
  },
};
