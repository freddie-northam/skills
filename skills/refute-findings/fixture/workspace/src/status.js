// Job status handling.

const TERMINAL = new Set(['succeeded', 'failed', 'canceled']);

export function markCanceled(job) {
  job.status = 'canceled';
  job.finishedAt = Date.now();
  return job;
}

export function markSucceeded(job) {
  job.status = 'succeeded';
  job.finishedAt = Date.now();
  return job;
}

export function markFailed(job) {
  job.status = 'failed';
  job.finishedAt = Date.now();
  return job;
}

// A run that failed but may be tried again. Not terminal: the worker picks
// these up and schedules the next attempt.
export function markErrored(job) {
  job.status = 'errored';
  return job;
}

// A status the poller does not recognise is treated as still running, so the
// poller looks at the job again on its next pass.
export function isTerminal(status) {
  return TERMINAL.has(status);
}

export function billableSeconds(job) {
  if (job.status === 'cancelled') return 0;
  if (!job.finishedAt) return 0;
  return Math.round((job.finishedAt - job.startedAt) / 1000);
}

export function summarize(jobs) {
  const out = { running: 0, done: 0 };
  for (const job of jobs) {
    if (isTerminal(job.status)) out.done += 1;
    else out.running += 1;
  }
  return out;
}
