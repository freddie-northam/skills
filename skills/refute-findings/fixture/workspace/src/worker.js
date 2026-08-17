import { backoffMs, shouldRetry } from './retry.js';
import { isTerminal, markFailed } from './status.js';

const MAX_ATTEMPTS = 5;

export function planNext(queue, job) {
  if (isTerminal(job.status)) return { action: 'done' };
  if (!shouldRetry(job)) return { action: 'wait' };

  const tried = queue.attemptsFor(job.id);
  if (tried >= MAX_ATTEMPTS) {
    markFailed(job);
    job.permanent = true;
    return { action: 'give-up' };
  }

  queue.recordAttempt(job.id);
  return { action: 'retry', delay: backoffMs(tried) };
}
