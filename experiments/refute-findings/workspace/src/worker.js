import { backoffMs, shouldRetry } from './retry.js';
import { isTerminal, markFailed } from './status.js';
import { limit } from './config.js';

export function planNext(queue, job) {
  if (isTerminal(job.status)) return { action: 'done' };
  if (!shouldRetry(job)) return { action: 'wait' };

  const tried = queue.attemptsFor(job.id);
  if (tried >= limit('maxAttempts')) {
    markFailed(job);
    job.permanent = true;
    return { action: 'give-up' };
  }

  queue.recordAttempt(job.id);
  return { action: 'retry', delay: backoffMs(tried) };
}
