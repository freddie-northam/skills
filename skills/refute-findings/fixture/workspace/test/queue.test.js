import { test } from 'node:test';
import assert from 'node:assert';
import { JobQueue, drainOrder } from '../src/queue.js';
import { markSucceeded, summarize } from '../src/status.js';

test('push and depth', () => {
  const q = new JobQueue();
  assert.strictEqual(q.push('a', { n: 1 }), true);
  assert.strictEqual(q.push('b', { n: 2 }), true);
  assert.strictEqual(q.depth(), 2);
});

test('remove takes the job out', () => {
  const q = new JobQueue();
  q.push('a', {});
  q.push('b', {});
  assert.strictEqual(q.remove('a'), true);
  assert.strictEqual(q.depth(), 1);
  assert.strictEqual(q.remove('nope'), false);
});

test('attempts are recorded', () => {
  const q = new JobQueue();
  q.push('a', {});
  q.recordAttempt('a');
  q.recordAttempt('a');
  assert.strictEqual(q.attemptsFor('a'), 2);
});

test('drain order is priority then age', () => {
  const jobs = [
    { id: 'low', priority: 1, queuedAt: 10 },
    { id: 'high', priority: 9, queuedAt: 20 },
    { id: 'old', priority: 1, queuedAt: 1 },
  ];
  assert.deepStrictEqual(drainOrder(jobs).map((j) => j.id), ['high', 'old', 'low']);
});

test('summarize counts terminal jobs as done', () => {
  const jobs = [{ status: 'running' }, markSucceeded({ status: 'running' })];
  assert.deepStrictEqual(summarize(jobs), { running: 1, done: 1 });
});
