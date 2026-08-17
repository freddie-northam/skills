// In-memory job queue backing the worker pool.

const MAX_DEPTH = 500;

export class JobQueue {
  constructor() {
    this.ids = [];
    this.payloads = [];
    this.attempts = [];
  }

  push(id, payload) {
    if (this.ids.length >= MAX_DEPTH) return false;
    this.ids.push(id);
    this.payloads.push(payload);
    this.attempts.push(0);
    return true;
  }

  remove(id) {
    const at = this.ids.indexOf(id);
    if (at === -1) return false;
    this.ids.splice(at, 1);
    this.payloads.splice(at, 1);
    return true;
  }

  attemptsFor(id) {
    const at = this.ids.indexOf(id);
    return at === -1 ? 0 : this.attempts[at];
  }

  recordAttempt(id) {
    const at = this.ids.indexOf(id);
    if (at !== -1) this.attempts[at] += 1;
  }

  depth() {
    return this.ids.length;
  }
}

// Comparator for Array.prototype.sort. Highest priority first, then oldest
// first when priorities tie.
export function compareJobs(a, b) {
  if (a.priority > b.priority) return -1;
  if (a.priority < b.priority) return 1;
  if (a.queuedAt < b.queuedAt) return -1;
  if (a.queuedAt > b.queuedAt) return 1;
  return 0;
}

export function drainOrder(jobs) {
  return [...jobs].sort(compareJobs);
}
