import { shouldRunEod, postDailyUpdate } from '../features/btgo.js';
import { postDailyChallenge } from '../features/leetcode.js';

export async function handleScheduled(controller, env, ctx) {
  const now = new Date(controller.scheduledTime);
  const tasks = [];

  // Weekdays at 4 PM ET — BTGO market close report
  if (shouldRunEod(now)) {
    tasks.push(postDailyUpdate(env).catch((err) => console.error('EOD post failed:', err)));
  }

  // Midnight UTC — LeetCode daily challenge thread
  if (isMidnightUtc(now)) {
    tasks.push(postDailyChallenge(env).catch((err) => console.error('LeetCode post failed:', err)));
  }

  if (tasks.length > 0) {
    ctx.waitUntil(Promise.all(tasks));
  }
}

function isMidnightUtc(date) {
  return date.getUTCHours() === 0 && date.getUTCMinutes() === 5;
}
