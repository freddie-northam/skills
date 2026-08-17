// Backoff schedule for failed jobs.

const BASE_MS = 100;

export function backoffMs(attempt) {
  return BASE_MS * 2 ** attempt;
}

export function shouldRetry(job) {
  return job.status === 'errored' && !job.permanent;
}
